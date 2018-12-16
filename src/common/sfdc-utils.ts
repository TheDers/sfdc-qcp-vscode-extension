import * as jsforce from 'jsforce';
import { OrgInfo, CustomScript, CustomScriptBase } from '../models';
import { QUERIES } from './constants';

export async function initConnection(orgInfo: OrgInfo, conn?: jsforce.Connection): Promise<jsforce.Connection> {
  if (conn) {
    return conn;
  }
  conn = new jsforce.Connection({ loginUrl: orgInfo.loginUrl });
  await conn.login(orgInfo.username || '', `${orgInfo.password}${orgInfo.apiToken || ''}`);
  return conn;
}

export async function queryAllRecords(conn: jsforce.Connection): Promise<CustomScript[]> {
  const results = await conn.query<CustomScript>(QUERIES.ALL_RECS());
  return results.records;
}

export async function queryAllRecordsWithoutCode(conn: jsforce.Connection): Promise<CustomScriptBase[]> {
  const results = await conn.query<CustomScriptBase>(QUERIES.ALL_WITHOUT_CODE());
  return results.records;
}

export async function queryRecordsById(conn: jsforce.Connection, id: string): Promise<CustomScript[]> {
  const results = await conn.query<CustomScript>(QUERIES.BY_ID_RECS(id));
  return results.records;
}

export async function queryRecordsByName(conn: jsforce.Connection, name: string, skipCode: boolean = false): Promise<CustomScript[]> {
  const query = skipCode ? QUERIES.BY_NAME_RECS_NO_CODE(name) : QUERIES.BY_NAME_RECS(name);
  const results = await conn.query<CustomScript>(query);
  return results.records;
}

export async function queryRecordCountByName(conn: jsforce.Connection, name: string): Promise<number[]> {
  const results = await conn.query<number>(QUERIES.BY_NAME_RECS_COUNT(name));
  return results.records;
}

export function getRecWithoutCode(records: CustomScript | CustomScript[]): CustomScriptBase[] {
  records = Array.isArray(records) ? records : [records];
  return records.map(rec => {
    const tempRec = { ...rec };
    delete tempRec.SBQQ__Code__c;
    return tempRec;
  });
}
