import { readFile } from 'fs-extra';
import * as jsforce from 'jsforce';
import * as path from 'path';
import { window } from 'vscode';
import { INPUT_OPTIONS } from '../constants';
import { ConfigData, CustomScriptUpsert, CustomScript } from '../models';
import { initConnection, queryRecordsById } from '../sfdc-utils';
import { getAllSrcFiles, saveRecordsToConfig } from '../utils';

/**
 * For all files provided, save or ask user if we should overwrite
 */
export async function getFileToPush(): Promise<string | undefined> {
  const existingFiles = await getAllSrcFiles();
  console.log('existingFiles', existingFiles);

  const pickedFile = await window.showQuickPick(INPUT_OPTIONS.PUSH_SHOW_FILE_LIST(existingFiles));
  console.log('pickedFile', pickedFile);
  if (pickedFile) {
    return pickedFile.label;
  }
}

export async function pushFile(configData: ConfigData, fileName: string, conn?: jsforce.Connection): Promise<CustomScript | undefined> {
  conn = await initConnection(configData.orgInfo, conn);
  const SBQQ__Code__c = await readFile(fileName, 'UTF-8');
  // TODO: tsc() to ensure types are removed if they exist
  const Name = path.basename(fileName).replace('.ts', '');
  const existingItem = configData.files.find(fileConfig => fileConfig.fileName === fileName);

  const record: CustomScriptUpsert = {
    Name,
    SBQQ__Code__c,
  };

  let results: jsforce.RecordResult;

  if (existingItem) {
    // existing item
    record.Id = existingItem.record.Id;
    results = await conn.sobject('SBQQ__CustomScript__c').update(record);
    console.log('results', results);
  } else {
    results = await conn.sobject('SBQQ__CustomScript__c').insert(record);
    console.log('results', results);
  }

  if (results.success) {
    const updatesRec = await queryRecordsById(conn, results.id);
    await saveRecordsToConfig(configData, updatesRec);
    return updatesRec[0];
  }
}
