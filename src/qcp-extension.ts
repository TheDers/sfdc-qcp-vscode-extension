import * as jsforce from 'jsforce';
import { Disposable, ExtensionContext, ProgressLocation, TextDocument, window, workspace } from 'vscode';
import { FILE_PATHS, INPUT_OPTIONS, MESSAGES, QP } from './constants';
import { backupFromRemote, backupLocal } from './flows/backup';
import { createConfig, createOrUpdateGitignore, getExampleFilesToPull } from './flows/init';
import { getFileToPull, getRemoteFiles, queryFilesAndSave } from './flows/pull';
import { getFileToPush, pushFile } from './flows/push';
import { ConfigData, StringOrUndefined } from './models';
import { initConnection } from './sfdc-utils';
import { copyExtensionFileToProject, fileExists, getAllSrcFiles, readAsJson, saveConfig } from './utils';

export class QcpExtension {
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

  private context: ExtensionContext;
  private subscriptions: Disposable[];

  constructor(context: ExtensionContext) {
    this.context = context;
    this.subscriptions = context.subscriptions;
    // Register
    this.registerListeners();
    this.initProject()
      .then(() => {
        console.log('Project Initialized');
      })
      .catch(err => {
        console.log('Error initializing', err);
      });
  }

  registerListeners() {
    workspace.onDidSaveTextDocument(this.onSave, this, this.subscriptions);
  }

  async initProject(): Promise<void> {
    if (workspace.name && workspace.rootPath) {
      const existingConfig = (await workspace.findFiles(FILE_PATHS.CONFIG.target, null, 1))[0];
      if (existingConfig) {
        this.configData = readAsJson<ConfigData>(existingConfig.fsPath);
        console.log('Project is SFDC QCP project.');
      }
    }
  }

  /**
   *
   * COMMANDS
   *
   */

  /**
   * COMMAND: Test Credentials
   * Checks to see if credentials are valid
   * NOTE: this is called from the INIT() command, and also called the INIT() command if user chooses to re-initialize
   */
  async testCredentials(): Promise<boolean> {
    try {
      await initConnection(this.configData.orgInfo, this.conn);
      window.showInformationMessage(MESSAGES.INIT.ORG_VALID);
      return true;
    } catch (ex) {
      const action = await window.showErrorMessage(MESSAGES.INIT.ORG_INVALID, 'Re-Initialize');
      if (action === 'Re-Initialize') {
        await this.init(true);
      }
      return false;
    }
  }

  /**
   * COMMAND: Initialize
   * This sets up a new project, or allows user to re-enter credentials
   * This will create all config/example files if they don't already exist
   */
  async init(isReInit?: boolean): Promise<StringOrUndefined> {
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
      await copyExtensionFileToProject(this.context, FILE_PATHS.README.src, FILE_PATHS.README.target);
      await copyExtensionFileToProject(this.context, FILE_PATHS.TSCONFIG.src, FILE_PATHS.TSCONFIG.target);
      // await copyFile(FILE_PATHS.README.target, FILE_PATHS.README.contents);
      // await copyFile(FILE_PATHS.TSCONFIG.target, FILE_PATHS.TSCONFIG.contents);
      await createOrUpdateGitignore();
    } catch (ex) {
      return window.showErrorMessage(`Error initializing project: ${ex.message}`);
    }

    await this.testCredentials();

    // Create example QCP file or pull all from org
    try {
      const hasExistingFiles = await fileExists('src/*.ts');
      if (!hasExistingFiles) {
        const pickedItem = await window.showQuickPick(INPUT_OPTIONS.INIT_QCP_EXAMPLE());
        if (pickedItem) {
          if (pickedItem.label === QP.INIT_QCP_EXAMPLE.EXAMPLE) {
            await this.initExampleFiles();
          } else {
            if (pickedItem.label === QP.INIT_QCP_EXAMPLE.EXAMPLE_AND_PULL) {
              await this.initExampleFiles();
            }
            await queryFilesAndSave(this.configData, { conn: this.conn });
          }
        }
      }
    } catch (ex) {
      return window.showErrorMessage('Error initializing project: ', ex.message);
    }
  }

  /**
   * COMMAND: Initialize Example Files
   * This sets up a new project, or allows user to re-enter credentials
   * This will create all config/example files if they don't already exist
   */
  async initExampleFiles() {
    try {
      const output = await getExampleFilesToPull(this.context);
      console.log('pickedFiles', output);
      if (output) {
        const { picked, all } = output;
        let filesToCopy = picked;
        if (picked && picked.length > 0) {
          if (picked.find(item => item === QP.EXAMPLES.ALL)) {
            filesToCopy = all;
          }
          for (let file of filesToCopy) {
            await copyExtensionFileToProject(this.context, `src/${file}`, `src/${file}`, true);
            window.showInformationMessage(MESSAGES.INIT.EXAMPLE_FILES_COPIED);
          }
        }
      }
    } catch (ex) {
      console.log('Error copying example files', ex);
      window.showErrorMessage(ex.message);
    }
  }

  /**
   * COMMAND: PULL FILES
   * This pulls all files from SFDC, saves them the the /src directory, and adds an entry in the config for this file
   */
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
          const records = await queryFilesAndSave(this.configData, { conn: this.conn });
          window.showInformationMessage(MESSAGES.PULL.ALL_RECS_SUCCESS(records.length));
          return;
        } catch (ex) {
          window.showErrorMessage(ex.message, { modal: true });
          return;
        }
      },
    );
  }

  /**
   * COMMAND: PULL FILE
   * This pulls one file, chosen by the user, from SFDC, and saves the file to the /src directory and updates the entry in the config
   */
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
              const records = await queryFilesAndSave(this.configData, { conn: this.conn, customScriptFile, clearFileData: false });
              window.showInformationMessage(MESSAGES.PULL.ALL_RECS_SUCCESS(records.length));
              return;
            } catch (ex) {
              window.showErrorMessage(ex.message, { modal: true });
              return;
            }
          },
        );
      }
    } catch (ex) {
      console.log('Error pulling', ex);
    }
  }

  /**
   * COMMAND: PULL REMOTE FILE
   * Get list of files on SFDC and pull specific file
   */
  async pullRemoteFile() {
    try {
      const records = await getRemoteFiles(this.configData, this.conn);
      if (records) {
        window.showInformationMessage(MESSAGES.PULL.ALL_RECS_SUCCESS(records.length));
      }
    } catch (ex) {
      console.log('Error pulling remove file', ex);
      window.showErrorMessage(ex.message);
    }
  }

  /**
   * COMMAND: PUSH FILE
   * Allows user to specify a file to push to SFDC
   */
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

  /**
   * COMMAND: PUSH ALL FILES
   * Saves all files to SFDC
   */

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
   * COMMAND: Backup
   * Allows user to copy all local files to a backup folder
   * Allows user to copy all remote records to a backup folder
   */
  async backup() {
    try {
      const pickedOption = await window.showQuickPick(INPUT_OPTIONS.BACKUP_CHOOSE_SRC());
      if (pickedOption) {
        const isLocal = pickedOption.label === QP.BACKUP_CHOOSE_SRC.LOCAL;

        window.withProgress(
          {
            location: ProgressLocation.Notification,
            title: MESSAGES.BACKUP.IN_PROGRESS(isLocal ? 'src directory' : 'Salesforce'),
            cancellable: false,
          },
          async (progress, token) => {
            try {
              if (isLocal) {
                const folderName = await backupLocal();
                window.showInformationMessage(MESSAGES.BACKUP.SUCCESS('local', folderName));
              } else {
                const folderName = await backupFromRemote(this.configData, this.conn);
                window.showInformationMessage(MESSAGES.BACKUP.SUCCESS('remote', folderName));
              }
            } catch (ex) {
              console.log(ex);
              window.showErrorMessage(`Error buckup up files: ${ex.message}.`);
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

  /**
   * EVENT: onSave
   * When the config file is manually modified, the contents is re-read into the configuration in memory
   */
  async onSave(ev: TextDocument) {
    // TODO: on save, look at settings and figure out if action is needed
    // If user manually updated config, we need to know!
    if (ev.fileName.endsWith(FILE_PATHS.CONFIG.target)) {
      this.configData = readAsJson<ConfigData>(ev.fileName);
      console.log('Config file updated');
    }
  }
}
