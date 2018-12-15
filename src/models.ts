export type StringOrUndefined = string | undefined;
export type OrgType = 'Sandbox' | 'Developer' | 'Production' | 'Custom URL';
export type LogEntryAction = 'push' | 'pull';
export type LogEntryStatus = 'success' | 'error';

export interface ConfigData {
  orgInfo: OrgInfo;
  files: CustomScriptFile[];
}
export interface CustomScriptFile {
  fileName: string;
  record: CustomScriptBase;
}

export interface OrgInfo {
  orgId?: string;
  orgType?: OrgType;
  loginUrl?: string;
  username?: string;
  password?: string;
  apiToken?: string;
}

export interface CustomScriptUpsert {
  Id?: string;
  Name: string;
  SBQQ__Code__c: string;
}

export interface CustomScriptBase {
  Id: string;
  Name: string;
  CreatedById: string;
  CreatedDate: string;
  LastModifiedById: string;
  LastModifiedDate: string;
  SBQQ__GroupFields__c: string;
  SBQQ__QuoteFields__c: string;
  SBQQ__QuoteLineFields__c: string;
  CreatedBy: {
    Id: string;
    Name: string;
    Username: string;
  };
  LastModifiedBy: {
    Id: string;
    Name: string;
    Username: string;
  };
}

export interface CustomScript extends CustomScriptBase {
  SBQQ__Code__c: string;
}

export interface LogEntry {
  action: LogEntryAction;
  status: LogEntryStatus;
  username?: string;
  fileName?: string;
  recordId?: string;
  recordName?: string;
  error?: string;
  timestamp: string;
}

// Get orgInfo and store
