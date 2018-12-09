import * as jsforce from 'jsforce';
import { getAllSrcFiles, getBackupFolderName, copyFile } from '../utils';
import { copyFileSync, ensureDir } from 'fs-extra';
import * as path from 'path';
import { initConnection, queryAllRecords } from '../sfdc-utils';
import { ConfigData } from '../models';
import * as sanitize from 'sanitize-filename';

export async function chooseBackup() {}

export async function backupLocal(): Promise<string> {
  // copy all files from SRC to backup dir
  const srcFiles = await getAllSrcFiles(1000);
  const backupFolderPath = await getBackupFolderName('local');
  await ensureDir(backupFolderPath);

  for (let file of srcFiles) {
    const fileName = path.basename(file.fsPath);
    copyFileSync(file.fsPath, path.join(backupFolderPath, fileName));
  }

  return backupFolderPath;
}

export async function backupFromRemote(configData: ConfigData, conn?: jsforce.Connection): Promise<string> {
  conn = await initConnection(configData.orgInfo, conn);
  let records;
  records = await queryAllRecords(conn);
  console.log('records', records);
  const backupFolderPath = await getBackupFolderName('remote');

  for (let record of records) {
    await copyFile(`/${backupFolderPath}/${sanitize(record.Name)}.ts`, record.SBQQ__Code__c, false, true);
  }

  console.log('saved downloaded files');

  return backupFolderPath;
}
