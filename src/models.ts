export interface ConfigData {
  pushOnSave: boolean;
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

export type StringOrUndefined = string | undefined;
export type OrgType = 'Sandbox' | 'Developer' | 'Production' | 'Custom URL';

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
