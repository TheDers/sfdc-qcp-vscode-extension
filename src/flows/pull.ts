import * as jsforce from 'jsforce';
import { ConfigData, CustomScript, CustomScriptFile } from '../models';
import { initConnection, queryAllRecords, queryRecordsById, queryAllRecordsWithoutCode } from '../sfdc-utils';
import { copyFile, saveRecordsToConfig } from '../utils';
import { INPUT_OPTIONS } from '../constants';
import { window } from 'vscode';
import * as sanitize from 'sanitize-filename';
import * as _ from 'lodash';

export interface QueryAndSaveOptions {
  conn?: jsforce.Connection;
  customScriptFile?: CustomScriptFile;
  recordId?: string;
  clearFileData?: boolean;
}

/**
 * For all files provided, save or ask user if we should overwrite
 */
export async function queryFilesAndSave(configData: ConfigData, options: QueryAndSaveOptions): Promise<CustomScript[]> {
  let { conn, customScriptFile, recordId, clearFileData } = options;
  if (!_.isBoolean(clearFileData)) {
    clearFileData = true;
  }
  conn = await initConnection(configData.orgInfo, conn);
  let records;
  if (customScriptFile) {
    records = await queryRecordsById(conn, customScriptFile.record.Id);
  } else if (recordId) {
    records = await queryRecordsById(conn, recordId);
  } else {
    records = await queryAllRecords(conn);
  }
  console.log('records', records);

  for (let record of records) {
    // TODO: handle file conflicts (ask the user what to do!)
    await copyFile(`/src/${sanitize(record.Name)}.ts`, record.SBQQ__Code__c);
  }

  console.log('saved downloaded files');
  if (clearFileData) {
    configData.files = [];
  }
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

export async function getRemoteFiles(configData: ConfigData, conn?: jsforce.Connection): Promise<CustomScript[] | undefined> {
  conn = await initConnection(configData.orgInfo, conn);
  const records = await queryAllRecordsWithoutCode(conn);
  console.log('records', records);

  const pickedFile = await window.showQuickPick(INPUT_OPTIONS.PULL_ONE_REMOTE_SHOW_FILE_LIST(records));
  console.log('pickedFile', pickedFile);
  if (pickedFile) {
    return await queryFilesAndSave(configData, { conn, recordId: pickedFile.description, clearFileData: false });
  }
}
