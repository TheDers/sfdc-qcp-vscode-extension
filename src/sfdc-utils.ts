import * as jsforce from 'jsforce';
import { OrgInfo, CustomScript, CustomScriptBase } from './models';
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

export async function queryRecordsById(conn: jsforce.Connection, id: string): Promise<CustomScript[]> {
  const results = await conn.query<CustomScript>(QUERIES.BY_ID_RECS(id));
  return results.records;
}

export async function queryRecordsByName(conn: jsforce.Connection, name: string): Promise<CustomScript[]> {
  const results = await conn.query<CustomScript>(QUERIES.BY_NAME_RECS(name));
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
