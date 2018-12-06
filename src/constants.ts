import { InputBoxOptions } from 'vscode';

/**
 * This file contains extension constants
 */

// global settings keys
export const SETTINGS = {
  NAMESPACE: 'sfdc-qcp',
};

export const MESSAGES = {
  INIT: {
    NO_WORKSPACE: 'There is no open folder, the initialize command only works if a folder is opened',
  },
};

export const INPUT_BOX_OPTIONS: { [name: string]: InputBoxOptions } = {
  INIT_CONFIG: {
    prompt: 'Enter salesforce org username of SFDC alias',
  },
};

export const FILE_PATHS = {
  README: {
    source: './files/README.md',
    target: '/README.md',
  },
  TSCONFIG: {
    source: './files/tsconfig.json',
    target: '/tsconfig.json',
  },
  TASKS: {
    source: './files/tasks.json',
    target: '/tasks.json',
  },
  CONFIG: {
    target: '/.qcp/qcp-config.json',
  },
  QCP: {
    source: './files/qcp.ts.example',
    target: '/src/qcp-example.ts',
  },
};

export interface IFilePaths {}
