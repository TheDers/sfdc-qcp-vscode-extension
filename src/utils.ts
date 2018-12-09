import { exec } from 'child_process';
import { workspace, Uri, ExtensionContext } from 'vscode';
import { writeFile, readFileSync, writeJson, pathExistsSync, ensureFile, copyFileSync } from 'fs-extra';
import * as path from 'path';
import { ConfigData, CustomScript } from './models';
import { FILE_PATHS, REGEX } from './constants';
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

export async function getBackupFolderName(suffix?: string) {
  const folderName = new Date().toJSON().substring(0, 10);
  let fullPathFolderName = getPathWithFileName(folderName);
  if (suffix) {
    fullPathFolderName += `-${suffix}`;
  }
  return getUnusedFolderName(fullPathFolderName);
}

/**
 * This gets a folder path, but if it is in use, a number suffix is added
 */
export function getUnusedFolderName(folderPath: string): string {
  if (pathExistsSync(folderPath)) {
    let suffixNumber = 1;
    let pathWithoutSuffix = folderPath;
    if (REGEX.ENDS_WITH_DASH_NUM.test(folderPath)) {
      const match = (folderPath.match(REGEX.ENDS_WITH_DASH_NUM) as RegExpMatchArray).index as number;
      suffixNumber = Number(folderPath.substring(match + 1)) + 1;
      pathWithoutSuffix = folderPath.substring(0, match);
    }
    return getUnusedFolderName(`${pathWithoutSuffix}-${suffixNumber}`);
  } else {
    return folderPath;
  }
}

/**
 * Copy file
 * @param fileName path to file
 * @param targetFilename path to copy file to
 * @param overwriteIfExists overwrite target file if it already exists, defaults to false
 */
export async function copyFile(
  targetFilename: string,
  contents: string,
  overwriteIfExists: boolean = false,
  alredyFullPath: boolean = false,
): Promise<boolean> {
  if (!alredyFullPath) {
    targetFilename = getPathWithFileName(targetFilename);
  }
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

export async function copyExtensionFileToProject(context: ExtensionContext, src: string, dest: string, overwriteIfExists: boolean = false) {
  const srcPath = context.asAbsolutePath(`extension-files/${src}`);
  const targetFilename = getPathWithFileName(dest);
  const exists = await fileExists(dest);
  if (overwriteIfExists || !exists) {
    await ensureFile(targetFilename);
    copyFileSync(srcPath, targetFilename);
  }
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
