import { workspace, Uri, ExtensionContext, OutputChannel } from 'vscode';
import { writeFile, readFileSync, writeJson, pathExistsSync, ensureFile, copyFileSync } from 'fs-extra';
import * as path from 'path';
import { ConfigData, CustomScript, CustomScriptFile, ConfigDataEncrypted, OrgInfo } from '../models';
import { FILE_PATHS, REGEX, IV_LENGTH } from './constants';
import { getRecWithoutCode } from './sfdc-utils';
import { createHash, createCipheriv, createDecipheriv, randomBytes } from 'crypto';

let _encryptionKey: string;

export function setEncryptionKey(key: string): string {
  _encryptionKey = key;
  return key;
}

export function getPathWithFileName(fileOrFolderName: string) {
  return path.join(workspace.rootPath || '', fileOrFolderName);
}

/**
 * Read configuration data from object, and decrypt if needed
 * This handles both encrypted and non-encrypted versions of the saved data
 * this allows for conversion of old projects to new projects (and possible setting in the future to allow folks to opt-out of encryption)
 * This can also perform any transformations as needed if the config model changes over time
 */
export async function readConfig(configData: ConfigData | ConfigDataEncrypted): Promise<ConfigData> {
  let newConfigData: ConfigData = {
    files: configData.files,
    orgInfo: {},
  };
  if (isEncryptedOrgInfo(configData)) {
    try {
      const orgInfo: OrgInfo = JSON.parse(decrypt(configData.orgInfo));
      newConfigData = {
        files: configData.files,
        orgInfo,
      };
      newConfigData.orgInfo = orgInfo;
    } catch (ex) {
      console.error('Error decrypting orgInfo');
    }
  } else {
    newConfigData.orgInfo = configData.orgInfo;
  }
  if (newConfigData.orgInfo && (newConfigData.orgInfo as any).username) {
    delete (newConfigData.orgInfo as any).username;
    delete (newConfigData.orgInfo as any).password;
    delete (newConfigData.orgInfo as any).apiToken;
  }
  return newConfigData;
}

/**
 * Save configuration data - the data saved to disk is encrypted
 */
export async function saveConfig(configData: ConfigData) {
  const configDataEncrypted: ConfigDataEncrypted = {
    orgInfo: encrypt(JSON.stringify(configData.orgInfo)),
    files: configData.files,
  };
  return writeFileAsJson(getPathWithFileName(FILE_PATHS.CONFIG.target), configDataEncrypted);
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

export async function getSrcFile(fileName: string, max: number = 50): Promise<Uri[]> {
  const glob = `${FILE_PATHS.SRC}/${fileName}`;
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
  alreadyFullPath: boolean = false,
): Promise<boolean> {
  if (!alreadyFullPath) {
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

export async function copyExtensionFileToProject(
  context: ExtensionContext,
  src: string,
  dest: string,
  overwriteIfExists: boolean = false,
): Promise<boolean> {
  const srcPath = context.asAbsolutePath(`extension-files/${src}`);
  const targetFilename = getPathWithFileName(dest);
  const exists = await fileExists(dest);
  if (overwriteIfExists || !exists) {
    await ensureFile(targetFilename);
    copyFileSync(srcPath, targetFilename);
    return true;
  }
  return false;
}

export async function saveRecordsToConfig(configData: ConfigData, records: CustomScript[]): Promise<CustomScriptFile[]> {
  const files: CustomScriptFile[] = [];
  getRecWithoutCode(records).forEach(record => {
    const fileName = getPathWithFileName(`/src/${record.Name}.ts`);
    // if we already have a file with the same name, use it
    // TODO: what if filename was modified?
    const foundItem = configData.files.find(file => file.record.Id === record.Id);
    if (foundItem) {
      files.push(foundItem);
      foundItem.record = record;
    } else {
      files.push({ fileName: fileName, record });
      configData.files.push({
        fileName: fileName,
        record,
      });
    }
  });

  await saveConfig(configData);
  return files;
}

export function isStringSame(str1: string, str2: string): boolean {
  const hash1 = createHash('md5')
    .update(str1)
    .digest('hex');
  const hash2 = createHash('md5')
    .update(str2)
    .digest('hex');
  return hash1 === hash2;
}

export function getSfdcUri(recordId: string) {
  return Uri.parse(`sfdc://sfdc/record/${recordId}.ts#${recordId}`);
}

export function parameterize(data: any = {}): string {
  return Object.keys(data)
    .map(key => `${key}=${encodeURIComponent(data[key])}`)
    .join('&');
}

export function generateEncryptionKey(): string {
  return randomBytes(16).toString('hex');
}

export function encrypt(value: string) {
  let iv = randomBytes(IV_LENGTH);
  let cipher = createCipheriv('aes-256-cbc', new Buffer(_encryptionKey), iv);
  let encrypted = cipher.update(value as any);

  encrypted = Buffer.concat([encrypted, cipher.final()]);

  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

export function decrypt(value: string) {
  let textParts = value.split(':');
  let iv = new Buffer(textParts.shift() as string, 'hex');
  let encryptedText = new Buffer(textParts.join(':'), 'hex');
  let decipher = createDecipheriv('aes-256-cbc', new Buffer(_encryptionKey), iv);
  let decrypted = decipher.update(encryptedText);

  decrypted = Buffer.concat([decrypted, decipher.final()]);

  return decrypted.toString();
}

export function isEncryptedOrgInfo(orgData: any): orgData is ConfigDataEncrypted {
  return typeof orgData.orgInfo === 'string';
}

export function logRecords(outputChannel: OutputChannel, title: string, records: (CustomScript | string)[]) {
  const header = `\n******************** ${title} ********************`;
  outputChannel.appendLine(header);
  records.forEach(rec => {
    if (typeof rec === 'string') {
      outputChannel.appendLine(`- ${rec}`);
    } else {
      outputChannel.appendLine(`- ${rec.Name} (${rec.Id})`);
    }
  });
}
