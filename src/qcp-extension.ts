import * as jsforce from 'jsforce';
import { Disposable, ProgressLocation, window, workspace } from 'vscode';
import { FILE_PATHS, INPUT_OPTIONS, MESSAGES } from './constants';
import { createConfig } from './flows/init';
import { queryFilesAndSave, getFileToPull } from './flows/pull';
import { getFileToPush, pushFile } from './flows/push';
import { ConfigData, StringOrUndefined } from './models';
import { copyFile, fileExists, getAllSrcFiles, readAsJson, saveConfig } from './utils';

export class QcpExtension {
  private isInit = false;
  private configData: ConfigData = {
    pushOnSave: false,
    orgInfo: {
      loginUrl: 'https://login.salesforce.com',
      username: '',
      password: '',
      apiToken: '',
    },
    files: [],
  };

  conn: jsforce.Connection | undefined;

  private subscriptions: Disposable[] = [];

  constructor() {
    console.log('constructor()');

    workspace.onDidSaveTextDocument(this.onSave, this, this.subscriptions);

    this.initProject()
      .then(() => {
        console.log('Project Initialized');
      })
      .catch(err => {
        console.log('Error initializing', err);
      });
  }

  async initProject(): Promise<void> {
    if (workspace.name && workspace.rootPath) {
      const existingConfig = (await workspace.findFiles(FILE_PATHS.CONFIG.target, null, 1))[0];
      if (existingConfig) {
        this.configData = readAsJson<ConfigData>(existingConfig.fsPath);
        this.isInit = true;
      }
    }
  }

  /**
   *
   * COMMANDS
   *
   */

  /**
   * COMMAND: Initialize
   * This sets up a new project, or allows user to re-enter credentials
   * This will create all config/example files if they don't already exist
   */
  async init(): Promise<StringOrUndefined> {
    if (!workspace.name || !workspace.rootPath) {
      return window.showErrorMessage(MESSAGES.INIT.NO_WORKSPACE);
    }

    /** Configure Connections */
    try {
      const orgInfo = await createConfig(this.configData.orgInfo);
      if (orgInfo) {
        this.configData.orgInfo = orgInfo;
        await saveConfig(this.configData);
      } else {
        return;
      }
    } catch (ex) {
      console.warn(ex);
      return window.showErrorMessage(`Error creating configuration file: ${ex.message}`);
    }

    try {
      // This will ignore copying if the files do not already exist
      await copyFile(FILE_PATHS.README.target, FILE_PATHS.README.contents);
      await copyFile(FILE_PATHS.TSCONFIG.target, FILE_PATHS.TSCONFIG.contents);

      window.showInformationMessage(MESSAGES.INIT.SUCCESS);
    } catch (ex) {
      return window.showErrorMessage(`Error initializing project: ${ex.message}`);
    }

    // Create example QCP file or pull all from org
    try {
      const hasExistingFiles = await fileExists('src/*.ts');
      if (!hasExistingFiles) {
        const pickedItem = await window.showQuickPick(INPUT_OPTIONS.INIT_QCP_EXAMPLE());
        if (pickedItem) {
          if (pickedItem.label === 'Start with example QCP file') {
            await copyFile(FILE_PATHS.QCP.target, FILE_PATHS.QCP.contents);
          } else {
            if (pickedItem.label === 'Pull all QCP files and create example QCP file') {
              await copyFile(FILE_PATHS.QCP.target, FILE_PATHS.QCP.contents);
            }
            await queryFilesAndSave(this.configData, this.conn);
          }
        }
      }
    } catch (ex) {
      return window.showErrorMessage('Error initializing project: ', ex.message);
    }
  }

  async pullFiles() {
    // TODO: ask user if they want to overwrite from remote, Y/N/ask for each

    window.withProgress(
      {
        location: ProgressLocation.Notification,
        title: MESSAGES.PULL.PROGRESS_ALL,
        cancellable: false,
      },
      async (progress, token) => {
        try {
          const records = await queryFilesAndSave(this.configData, this.conn);
          window.showInformationMessage(MESSAGES.PULL.ALL_RECS_SUCCESS(records.length));
          return;
        } catch (ex) {
          window.showErrorMessage(ex.message, { modal: true });
          return;
        }
      },
    );
  }

  async pullFile() {
    try {
      const customScriptFile = await getFileToPull(this.configData);
      if (customScriptFile) {
        window.withProgress(
          {
            location: ProgressLocation.Notification,
            title: MESSAGES.PULL.PROGRESS_ONE(customScriptFile.fileName),
            cancellable: false,
          },
          async (progress, token) => {
            try {
              const records = await queryFilesAndSave(this.configData, this.conn, customScriptFile);
              window.showInformationMessage(MESSAGES.PULL.ALL_RECS_SUCCESS(records.length));
              return;
            } catch (ex) {
              window.showErrorMessage(ex.message, { modal: true });
              return;
            }
          },
        );
      }
    } catch (ex) {}
  }

  async pushFile() {
    // TODO: either push current file or choose one (maybe default to active file)
    try {
      const file = await getFileToPush();
      if (file) {
        window.withProgress(
          {
            location: ProgressLocation.Notification,
            title: MESSAGES.PUSH.PROGRESS_ONE,
            cancellable: false,
          },
          async (progress, token) => {
            try {
              const updatedRecord = await pushFile(this.configData, file, this.conn);
              if (updatedRecord) {
                window.showInformationMessage(MESSAGES.PUSH.SUCCESS(updatedRecord.Name));
              } else {
                window.showErrorMessage(MESSAGES.PUSH.ERROR);
              }
              // TODO: re-query record (maybe in pushFile)
            } catch (ex) {
              window.showErrorMessage(ex.message);
            }
          },
        );
      }
    } catch (ex) {
      window.showErrorMessage(ex.message);
    }
  }
  async pushAllFiles() {
    try {
      const pickedItem = await window.showQuickPick(INPUT_OPTIONS.PUSH_ALL_CONFIRM());
      if (pickedItem && pickedItem.label === INPUT_OPTIONS.PUSH_ALL_CONFIRM()[0].label) {
        window.withProgress(
          {
            location: ProgressLocation.Notification,
            title: MESSAGES.PUSH.PROGRESS_MULTI,
            cancellable: true,
          },
          async (progress, token) => {
            let doCancel = false;
            token.onCancellationRequested(() => {
              console.log('User canceled the long running operation');
              doCancel = true;
            });
            const existingFiles = await getAllSrcFiles();
            const total = existingFiles.length;
            let increment = 100 / total;
            let count = 0;
            for (const file of existingFiles) {
              count++;
              if (doCancel) {
                window.showInformationMessage(`Remaining files cancelled`);
                break;
              }
              try {
                const record = await pushFile(this.configData, file.fsPath, this.conn);
                if (record) {
                  window.showInformationMessage(`Successfully pushed ${record.Name}.`);
                }
              } catch (ex) {
                window.showErrorMessage(`Error uploading file: ${ex.message}.`);
              } finally {
                progress.report({ increment, message: `Uploading file ${count} of ${total}` });
              }
            }
          },
        );
      }
    } catch (ex) {}
  }

  /**
   *
   * EVENT LISTENERS
   *
   */

  async onSave() {
    // TODO: on save, look at settings and figure out if action is needed
    // If user manually updated config, we need to know!
  }
}
