import { exec } from 'child_process';
import { workspace, Uri } from 'vscode';
import { writeFile, readFileSync, writeJson, ensureFile } from 'fs-extra';
import * as path from 'path';
import { ConfigData, CustomScript } from './models';
import { FILE_PATHS } from './constants';
import { getRecWithoutCode } from './sfdc-utils';

export function getPathWithFileName(fileOrFolderName: string) {
  return path.join(workspace.rootPath || '', fileOrFolderName);
}

export function saveConfig(configData: ConfigData) {
  return writeFileAsJson(getPathWithFileName(FILE_PATHS.CONFIG.target), configData);
}

export function readAsJson<T>(path: string): T {
  return JSON.parse(readFileSync(path, 'UTF-8'));
}

export async function writeFileAsJson(path: string, data: any): Promise<void> {
  await ensureFile(path);
  await writeJson(path, data, { spaces: 2 });
}

export async function fileExists(fileName: string): Promise<boolean> {
  return (await workspace.findFiles(fileName, null, 1)).length > 0;
}

export async function getAllSrcFiles(max: number = 50): Promise<Uri[]> {
  const glob = `${FILE_PATHS.SRC}/*.ts`;
  return await workspace.findFiles(glob, null, max);
}

/**
 * Copy file
 * @param fileName path to file
 * @param targetFilename path to copy file to
 * @param overwriteIfExists overwrite target file if it already exists, defaults to false
 */
export async function copyFile(targetFilename: string, contents: string, overwriteIfExists: boolean = false): Promise<boolean> {
  targetFilename = getPathWithFileName(targetFilename);
  if (overwriteIfExists || !(await fileExists(targetFilename))) {
    // creating new config file
    try {
      await ensureFile(targetFilename);
      await writeFile(targetFilename, contents);
      return true;
    } catch (ex) {
      console.log('Error saving file', targetFilename, ex.message);
      return false;
    }
  } else {
    return false;
  }
}

export async function compileQCP() {
  const compileCommand = `tsc -p ${workspace.rootPath}`;
  await execAsync(compileCommand);
}

/**
 * Promise for stdout from exec
 *
 * @param command the command to pass through to exec
 * @returns Promise for string with stdout
 */
export async function execAsync(command: string): Promise<string> {
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

export async function saveRecordsToConfig(configData: ConfigData, records: CustomScript[]) {
  getRecWithoutCode(records).forEach(record => {
    const fileName = getPathWithFileName(`/src/${record.Name}.ts`);
    // if we already have a file with the same name, use it
    // TODO: what if filename was modified?
    const foundItem = configData.files.find(file => file.record.Id === record.Id);
    if (foundItem) {
      foundItem.record = record;
    } else {
      configData.files.push({
        fileName: fileName,
        record,
      });
    }
  });

  await saveConfig(configData);
  console.log('saved config');
}
