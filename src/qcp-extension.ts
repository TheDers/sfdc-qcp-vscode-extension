import { Disposable, workspace, window } from 'vscode';
import { writeFileSync, copy } from 'fs-extra';
import * as path from 'path';
import { MESSAGES, INPUT_BOX_OPTIONS, FILE_PATHS } from './constants';
import { exec } from 'child_process';

interface Data {
  orgId?: string;
  username?: string;
  pushOnSave: boolean;
  files: {
    id: string;
    name: string;
    createdDate: string;
    createdUser: string;
    lastModifiedDate: string;
    lastModifiedUser: string;
  }[];
}

type StringOrUndefined = string | undefined;

export class QcpExtension {
  data: Data = {
    pushOnSave: false,
    files: [],
  };

  subscriptions: Disposable[] = [];

  constructor() {
    console.log('constructor()');
    workspace.onDidSaveTextDocument(this.onSave, this, this.subscriptions);
    // this.initConfig();
  }

  async initConfig() {
    // TODO: detect if this is a qcp project and read in config if so
  }

  async init(): Promise<StringOrUndefined> {
    if (!workspace.name || !workspace.rootPath) {
      return window.showErrorMessage(MESSAGES.INIT.NO_WORKSPACE);
    }
    // TODO: create readme, create tsconfig, create config

    const configError = await this.createConfig();
    if (configError) {
      return configError;
    }

    try {
      await this.copyFile(FILE_PATHS.README.source, FILE_PATHS.README.target);
      await this.copyFile(FILE_PATHS.TSCONFIG.source, FILE_PATHS.TSCONFIG.target);
      await this.copyFile(FILE_PATHS.TASKS.source, FILE_PATHS.TASKS.target);
      await this.copyFile(FILE_PATHS.QCP.source, FILE_PATHS.QCP.target);
    } catch (ex) {
      return window.showErrorMessage('Error initializing project: ', ex);
    }
  }

  async createConfig(): Promise<StringOrUndefined> {
    try {
      this.data.username = await window.showInputBox(INPUT_BOX_OPTIONS.INIT_CONFIG);
    } catch (ex) {
      return window.showErrorMessage('Error getting org username: ', ex);
    }

    if (!(await this.fileExists(FILE_PATHS.CONFIG.target))) {
      try {
        await writeFileSync(path.join(FILE_PATHS.CONFIG.target), JSON.stringify(this.data, null, 2));
      } catch (ex) {
        return window.showErrorMessage('Error creating configuration file: ', ex);
      }
    }
  }

  async updateConfile(): Promise<StringOrUndefined> {
    // TODO: update files or whatever other config value
    return;
  }

  async onSave() {
    // TODO: on save, look at settings and figure out if action is needed
  }

  async pullFiles() {}
  async refreshFile() {}
  async pushFile() {
    // TODO: either push current file or choose one (maybe default to active file)
  }
  async pushAllFiles() {}

  private async fileExists(fileName: string): Promise<boolean> {
    return (await workspace.findFiles(fileName, null, 1)).length > 0;
  }

  private async copyFile(fileName: string, targetFilename: string, overwriteIfExists: boolean = false): Promise<boolean> {
    targetFilename = `${workspace.rootPath || ''}${targetFilename}`;
    if (overwriteIfExists || !(await this.fileExists(fileName))) {
      // creating new config file
      try {
        await copy(path.join(fileName), path.join(targetFilename));
        return true;
      } catch (ex) {
        console.log('Error saving file', fileName, ex);
        return false;
      }
    } else {
      return false;
    }
  }

  private static async compileQCP() {
    const compileCommand = `tsc -p ${workspace.rootPath}`;
    await this.execAsync(compileCommand);
  }

  /**
   * Promise for stdout from exec
   *
   * @param command the command to pass through to exec
   * @returns Promise for string with stdout
   */
  private static async execAsync(command: string): Promise<string> {
    return new Promise((resolve: (value?: string | PromiseLike<string> | undefined) => void, reject) => {
      exec(command, (err, stdout, stderr) => {
        if (err || stderr) {
          const errorMessage = err ? err.message : stderr;
          reject(errorMessage);
        } else {
          resolve(stdout);
        }
      });
    });
  }
}
