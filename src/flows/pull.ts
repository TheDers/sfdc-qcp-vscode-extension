import * as jsforce from 'jsforce';
import { ConfigData, CustomScript, CustomScriptFile } from '../models';
import { initConnection, queryAllRecords, queryRecordsById } from '../sfdc-utils';
import { copyFile, saveRecordsToConfig } from '../utils';
import { INPUT_OPTIONS } from '../constants';
import { window } from 'vscode';

/**
 * For all files provided, save or ask user if we should overwrite
 */
export async function queryFilesAndSave(
  configData: ConfigData,
  conn?: jsforce.Connection,
  customScriptFile?: CustomScriptFile,
): Promise<CustomScript[]> {
  conn = await initConnection(configData.orgInfo, conn);
  let records;
  if (customScriptFile) {
    records = await queryRecordsById(conn, customScriptFile.record.Id);
  } else {
    records = await queryAllRecords(conn);
  }
  console.log('records', records);

  // TODO: handle file conflicts
  await Promise.all(records.map(record => copyFile(`/src/${record.Name}.ts`, record.SBQQ__Code__c)));

  console.log('saved downloaded files');

  configData.files = [];
  // remove code from each file
  await saveRecordsToConfig(configData, records);

  return records;
}

/**
 * For all files provided, save or ask user if we should overwrite
 */
export async function getFileToPull(configData: ConfigData): Promise<CustomScriptFile | undefined> {
  const pickedFile = await window.showQuickPick(INPUT_OPTIONS.PULL_ONE_SHOW_FILE_LIST(configData.files));
  console.log('pickedFile', pickedFile);
  if (pickedFile) {
    return configData.files.find(file => file.fileName === pickedFile.label);
  }
}
