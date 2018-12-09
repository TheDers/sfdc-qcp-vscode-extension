import { InputBoxOptions, QuickPickItem, Uri } from 'vscode';
import { FILES } from './files';
import { CustomScriptFile } from './models';

/**
 * This file contains extension constants
 */

// global settings keys
export const SETTINGS = {
  NAMESPACE: 'sfdc-qcp',
};

export const MESSAGES = {
  INIT: {
    NO_WORKSPACE: 'There is no open folder, the initialize command only works if a folder is opened.',
    SUCCESS: 'Your project has been successfully configured.',
  },
  PULL: {
    ALL_RECS_SUCCESS: (count: number = 0) => `Successfully downloaded and saved ${count} file${count === 1 ? '' : 's'} from Salesforce.`,
    PROGRESS_ALL: 'Downloading all QCP files from Salesforce.',
    PROGRESS_ONE: (file: string) => `Downloading ${file} from Salesforce.`,
  },
  PUSH: {
    SUCCESS: (filename: string) => `Successfully pushed ${filename} to Salesforce.`,
    ERROR: 'There was an error pushing this file to Salesforce.',
    PROGRESS_ONE: 'Pushing file to Salesforce.',
    PROGRESS_MULTI: 'Pushing files to Salesforce.',
  },
};

type INPUT_OPTIONS = {
  INIT_USERNAME_INPUT: (currValue?: string) => InputBoxOptions;
  INIT_PASSWORD_INPUT: (currValue?: string) => InputBoxOptions;
  INIT_API_TOKEN_INPUT: (currValue?: string) => InputBoxOptions;
  INIT_ORG_TYPE_QUICK_ITEM: (currValue?: string) => QuickPickItem[];
  INIT_ORG_TYPE_CUSTOM_INPUT: (currValue?: string) => InputBoxOptions;
  INIT_QCP_EXAMPLE: () => QuickPickItem[];
  PULL_ONE_SHOW_FILE_LIST: (files: CustomScriptFile[]) => QuickPickItem[];
  PUSH_SHOW_FILE_LIST: (uris: Uri[]) => QuickPickItem[];
  PUSH_ALL_CONFIRM: () => QuickPickItem[];
};

export const INPUT_OPTIONS: INPUT_OPTIONS = {
  INIT_USERNAME_INPUT: (currValue?: string) => ({
    prompt: 'Enter salesforce org username of SFDC alias',
    ignoreFocusOut: true,
    value: currValue,
  }),
  INIT_PASSWORD_INPUT: (currValue?: string) => ({
    prompt: 'Enter your Salesforce Password',
    password: true,
    ignoreFocusOut: true,
    value: currValue,
  }),
  INIT_API_TOKEN_INPUT: (currValue?: string) => ({
    prompt: 'Enter your API Token (Required if you IP address is not white listed)',
    password: false,
    ignoreFocusOut: true,
    value: currValue,
  }),
  INIT_ORG_TYPE_QUICK_ITEM: (currValue?: string) => [
    { label: 'Sandbox', description: 'https://test.salesforce.com', picked: currValue === 'Sandbox' },
    { label: 'Developer', description: 'https://login.salesforce.com', picked: currValue === 'Developer' },
    { label: 'Production', description: 'https://login.salesforce.com', picked: currValue === 'Production' },
    { label: 'Custom URL', description: 'https://{domain}.my.salesforce.com', picked: currValue === 'Custom URL' },
  ],
  INIT_ORG_TYPE_CUSTOM_INPUT: (currValue?: string) => ({
    ignoreFocusOut: true,
    placeHolder: '',
    prompt: 'Custom URL',
    value: currValue || 'https://domain.my.salesforce.com',
    valueSelection: [8, 14],
  }),
  INIT_QCP_EXAMPLE: () => [
    { label: 'Start with example QCP file', picked: true, alwaysShow: true },
    { label: 'Pull all QCP files from org', picked: false, alwaysShow: true },
    { label: 'Pull all QCP files and create example QCP file', picked: true, alwaysShow: true },
  ],
  PULL_ONE_SHOW_FILE_LIST: (files: CustomScriptFile[]) => {
    return files.map(file => ({ label: file.fileName, picked: false }));
  },
  PUSH_SHOW_FILE_LIST: (uris: Uri[]) => {
    return uris.map(uri => ({ label: uri.path, picked: false }));
  },
  PUSH_ALL_CONFIRM: () => [
    { label: 'Yes - Push all files to Salesforce', picked: true, alwaysShow: true },
    { label: 'No - Get me outta here!', picked: false, alwaysShow: true },
  ],
};

export const FILE_PATHS = {
  CONFIG: {
    target: '.qcp/qcp-config.json',
  },
  README: {
    contents: FILES.README,
    target: 'README.md',
  },
  TSCONFIG: {
    contents: FILES.TSCONFIG,
    target: 'tsconfig.json',
  },
  QCP: {
    contents: FILES.QCP,
    target: 'src/qcp-example.ts',
  },
  SRC: 'src',
};

const QUERY_FIELDS = `Id, Name, CreatedById, CreatedDate, LastModifiedById, LastModifiedDate, SBQQ__Code__c, SBQQ__GroupFields__c, SBQQ__QuoteFields__c, SBQQ__QuoteLineFields__c, CreatedBy.Id, CreatedBy.Name, CreatedBy.Username, LastModifiedBy.Id, LastModifiedBy.Name, LastModifiedBy.Username`;
export const QUERIES = {
  ALL_RECS: () => `SELECT ${QUERY_FIELDS} FROM SBQQ__CustomScript__c`,
  BY_ID_RECS: (id: string) => `SELECT ${QUERY_FIELDS} FROM SBQQ__CustomScript__c WHERE Id = '${id}'`,
  BY_NAME_RECS: (name: string) => `SELECT ${QUERY_FIELDS} FROM SBQQ__CustomScript__c WHERE Name = '${name}'`,
};

export interface IFilePaths {}
