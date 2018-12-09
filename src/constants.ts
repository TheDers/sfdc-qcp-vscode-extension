import { InputBoxOptions, QuickPickItem, Uri } from 'vscode';
import { CustomScriptFile, CustomScriptBase } from './models';
import { FILES } from './files';
import { basename } from 'path';

/**
 * This file contains extension constants
 */

export const REGEX = {
  ENDS_WITH_DASH_NUM: /-\d+$/,
};

// global settings keys
export const SETTINGS = {
  NAMESPACE: 'sfdc-qcp',
};

export const GITIGNORE_CONTENTS = `

# Added by VSCode Plugin - SFDC QCP
.qcp

`;

export const QP = {
  INIT_QCP_EXAMPLE: {
    EXAMPLE: 'Start with example QCP files',
    PULL: 'Pull all QCP files from org',
    EXAMPLE_AND_PULL: 'Pull all QCP files and create example QCP file',
  },
  INIT_ORG_TYPE_QUICK_ITEM: {
    SANDBOX: 'Sandbox',
    DEV: 'Developer',
    PROD: 'Production',
    CUSTOM: 'Custom URL',
  },
  EXAMPLES: {
    ALL: 'All example files',
  },
  BACKUP_CHOOSE_SRC: {
    LOCAL: 'Local - Copy all files in src folder to backup directory.',
    REMOTE: 'Remote - Fetch all files from remote and put into backup directory.',
  },
  PUSH_ALL_CONFIRM: {
    YES: 'Yes - Push all files to Salesforce',
    NO: 'No - Get me outta here!',
  },
};

export const MESSAGES = {
  INIT: {
    NO_WORKSPACE: 'There is no open folder, the initialize command only works if a folder is opened.',
    SUCCESS: 'Your project has been successfully configured.',
    ORG_VALID: 'Your credential are valid.',
    ORG_INVALID: 'Your credential are invalid.',
    EXAMPLE_FILES_COPIED: `Successfully copied example files`,
  },
  PULL: {
    ALL_RECS_SUCCESS: (count: number = 0) => `Successfully downloaded and saved ${count} file${count === 1 ? '' : 's'} from Salesforce.`,
    PROGRESS_ALL: 'Downloading all QCP files from Salesforce.',
    PROGRESS_ONE: (file: string) => `Downloading ${file} from Salesforce.`,
    PROGRESS_REMOTE_LIST: `Getting list of scripts from Salesforce.`,
  },
  PUSH: {
    SUCCESS: (filename: string) => `Successfully pushed ${filename} to Salesforce.`,
    ERROR: 'There was an error pushing this file to Salesforce.',
    PROGRESS_ONE: 'Pushing file to Salesforce.',
    PROGRESS_MULTI: 'Pushing files to Salesforce.',
  },
  BACKUP: {
    IN_PROGRESS: (src: string) => `Backing up files from ${src}.`,
    SUCCESS: (src: string, folderName: string) => `Successfully backed up ${src} files to ${folderName}.`,
  },
};

type INPUT_OPTIONS = {
  INIT_USERNAME_INPUT: (currValue?: string) => InputBoxOptions;
  INIT_PASSWORD_INPUT: (currValue?: string) => InputBoxOptions;
  INIT_API_TOKEN_INPUT: (currValue?: string) => InputBoxOptions;
  INIT_ORG_TYPE_QUICK_ITEM: (currValue?: string) => QuickPickItem[];
  INIT_ORG_TYPE_CUSTOM_INPUT: (currValue?: string) => InputBoxOptions;
  INIT_QCP_EXAMPLE: () => QuickPickItem[];
  INIT_QCP_EXAMPLE_ALL: (files: string[]) => QuickPickItem[];
  PULL_ONE_SHOW_FILE_LIST: (files: CustomScriptFile[]) => QuickPickItem[];
  PULL_ONE_REMOTE_SHOW_FILE_LIST: (files: CustomScriptBase[]) => QuickPickItem[];
  PUSH_SHOW_FILE_LIST: (uris: Uri[]) => QuickPickItem[];
  PUSH_ALL_CONFIRM: () => QuickPickItem[];
  BACKUP_CHOOSE_SRC: () => QuickPickItem[];
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
    {
      label: QP.INIT_ORG_TYPE_QUICK_ITEM.SANDBOX,
      description: 'https://test.salesforce.com',
      picked: currValue === QP.INIT_ORG_TYPE_QUICK_ITEM.SANDBOX,
    },
    {
      label: QP.INIT_ORG_TYPE_QUICK_ITEM.DEV,
      description: 'https://login.salesforce.com',
      picked: currValue === QP.INIT_ORG_TYPE_QUICK_ITEM.DEV,
    },
    {
      label: QP.INIT_ORG_TYPE_QUICK_ITEM.PROD,
      description: 'https://login.salesforce.com',
      picked: currValue === QP.INIT_ORG_TYPE_QUICK_ITEM.PROD,
    },
    {
      label: QP.INIT_ORG_TYPE_QUICK_ITEM.CUSTOM,
      description: 'https://{domain}.my.salesforce.com',
      picked: currValue === QP.INIT_ORG_TYPE_QUICK_ITEM.CUSTOM,
    },
  ],
  INIT_ORG_TYPE_CUSTOM_INPUT: (currValue?: string) => ({
    ignoreFocusOut: true,
    placeHolder: '',
    prompt: 'Custom URL',
    value: currValue || 'https://domain.my.salesforce.com',
    valueSelection: [8, 14],
  }),
  INIT_QCP_EXAMPLE: () => [
    { label: QP.INIT_QCP_EXAMPLE.EXAMPLE, picked: true, alwaysShow: true },
    { label: QP.INIT_QCP_EXAMPLE.PULL, picked: false, alwaysShow: true },
    { label: QP.INIT_QCP_EXAMPLE.EXAMPLE_AND_PULL, picked: true, alwaysShow: true },
  ],
  INIT_QCP_EXAMPLE_ALL: (files: string[]) => {
    const items: QuickPickItem[] = [{ label: QP.EXAMPLES.ALL, alwaysShow: true }];
    files.forEach(file => {
      items.push({ label: file, alwaysShow: true });
    });
    return items;
  },
  PULL_ONE_SHOW_FILE_LIST: (files: CustomScriptFile[]) => {
    return files.map(file => ({ label: file.fileName, picked: false }));
  },
  PULL_ONE_REMOTE_SHOW_FILE_LIST: (records: CustomScriptBase[]) => {
    return records.map(record => ({
      label: record.Name,
      description: record.Id,
      detail: `Last Modified by ${(record.LastModifiedBy || record.CreatedBy).Username} at ${record.LastModifiedDate.substring(0, 19)}`,
      picked: false,
    }));
  },
  PUSH_SHOW_FILE_LIST: (uris: Uri[]) => {
    return uris.map(uri => ({ label: uri.path, picked: false }));
  },
  PUSH_ALL_CONFIRM: () => [
    { label: QP.PUSH_ALL_CONFIRM.YES, picked: true, alwaysShow: true },
    { label: QP.PUSH_ALL_CONFIRM.NO, picked: false, alwaysShow: true },
  ],
  BACKUP_CHOOSE_SRC: () => [{ label: QP.BACKUP_CHOOSE_SRC.LOCAL, picked: true }, { label: QP.BACKUP_CHOOSE_SRC.REMOTE, picked: false }],
};

export const FILE_PATHS = {
  CONFIG: {
    target: '.qcp/qcp-config.json',
  },
  README: {
    contents: FILES.README,
    src: 'README.md',
    target: 'README.md',
  },
  TSCONFIG: {
    contents: FILES.TSCONFIG,
    src: 'tsconfig.json',
    target: 'tsconfig.json',
  },
  QCP: {
    contents: FILES.QCP,
    src: 'src/qcp-example.ts',
    target: 'src/qcp-example.ts',
  },
  SRC: 'src',
};

const QUERY_FIELDS_BASE = `Id, Name`;
const QUERY_FIELDS_USER_FIELDS = `CreatedById, CreatedDate, LastModifiedById, LastModifiedDate, CreatedBy.Id, CreatedBy.Name, CreatedBy.Username, LastModifiedBy.Id, LastModifiedBy.Name, LastModifiedBy.Username`;
const QUERY_FIELDS_WO_CODE = `${QUERY_FIELDS_BASE}, ${QUERY_FIELDS_USER_FIELDS}`;
const QUERY_FIELDS_ALL = `${QUERY_FIELDS_WO_CODE}, SBQQ__Code__c, SBQQ__GroupFields__c, SBQQ__QuoteFields__c, SBQQ__QuoteLineFields__c`;

export const QUERIES = {
  ALL_WITHOUT_CODE: () => `SELECT ${QUERY_FIELDS_WO_CODE} FROM SBQQ__CustomScript__c`,
  ALL_RECS: () => `SELECT ${QUERY_FIELDS_ALL} FROM SBQQ__CustomScript__c`,
  BY_ID_RECS: (id: string) => `SELECT ${QUERY_FIELDS_ALL} FROM SBQQ__CustomScript__c WHERE Id = '${id}'`,
  BY_NAME_RECS: (name: string) => `SELECT ${QUERY_FIELDS_ALL} FROM SBQQ__CustomScript__c WHERE Name = '${name}'`,
};
