import { readdir, readFile, writeFile } from 'fs-extra';
import * as _ from 'lodash';
import { ExtensionContext, QuickPickItem, window, workspace } from 'vscode';
import { GITIGNORE_CONTENTS, INPUT_OPTIONS, QP } from '../common/constants';
import { OrgInfo, OrgType } from '../models';
import { getPathWithFileName } from '../common/utils';

/**
 * Get credentials
 */
export async function initializeOrgs(orgInfo: OrgInfo): Promise<OrgInfo | undefined> {
  orgInfo = { ...orgInfo };

  const loginUrl = await getOrgType(orgInfo);
  if (_.isNil(loginUrl)) {
    return;
  }
  orgInfo.loginUrl = loginUrl;

  const username = await window.showInputBox(INPUT_OPTIONS.INIT_USERNAME_INPUT(orgInfo.username));
  if (_.isNil(username)) {
    return;
  }
  if (orgInfo.username !== username) {
    orgInfo.password = '';
    orgInfo.apiToken = '';
  }
  orgInfo.username = username;

  const password = await window.showInputBox(INPUT_OPTIONS.INIT_PASSWORD_INPUT(orgInfo.password));
  if (_.isNil(password)) {
    return;
  }
  orgInfo.password = password;

  const apiToken = await window.showInputBox(INPUT_OPTIONS.INIT_API_TOKEN_INPUT(orgInfo.apiToken));
  if (_.isNil(apiToken)) {
    return;
  }
  orgInfo.apiToken = apiToken;

  return orgInfo;
}

/**
 * Allow user to specify the org type or custom login URL
 */
async function getOrgType(orgInfo: OrgInfo): Promise<string | undefined> {
  const items: QuickPickItem[] = INPUT_OPTIONS.INIT_ORG_TYPE_QUICK_ITEM(orgInfo.orgType);

  const preSelectedItem = items.find(item => item.label === orgInfo.orgType);
  if (preSelectedItem) {
    preSelectedItem.picked = true;
  }

  const pickedItem = await window.showQuickPick(items, { canPickMany: false, ignoreFocusOut: true });

  if (pickedItem) {
    orgInfo.orgType = pickedItem.label as OrgType;
    if (pickedItem.label === QP.INIT_ORG_TYPE_QUICK_ITEM.CUSTOM) {
      return await window.showInputBox(INPUT_OPTIONS.INIT_ORG_TYPE_CUSTOM_INPUT(orgInfo.username));
    }
    return pickedItem.description;
  }
}

export async function createOrUpdateGitignore(): Promise<boolean> {
  const existingGitIgnore = (await workspace.findFiles('.gitignore', null, 1))[0];
  let fileToUpdateOrCreate: string = '';
  let filePath;
  if (existingGitIgnore) {
    filePath = existingGitIgnore.fsPath;
    // search through and see if .qcp exists in it, if not, add it
    const gitignore = await readFile(existingGitIgnore.fsPath, 'UTF-8');
    const lines = gitignore.split('\n');
    const existingIdx = lines.findIndex(line => line.trim() === '.qcp');
    if (existingIdx < 0) {
      fileToUpdateOrCreate = gitignore + GITIGNORE_CONTENTS;
    }
  } else {
    filePath = getPathWithFileName('.gitignore');
    // create the file!
    fileToUpdateOrCreate = GITIGNORE_CONTENTS;
  }
  if (fileToUpdateOrCreate) {
    await writeFile(filePath, fileToUpdateOrCreate);
    return true;
  }
  return false;
}

export async function getExampleFilesToCreate(context: ExtensionContext): Promise<{ picked: string[]; all: string[] } | undefined> {
  const srcPath = context.asAbsolutePath(`extension-files/src`);

  const exampleFiles = await readdir(srcPath);

  const pickedFiles = await window.showQuickPick(INPUT_OPTIONS.INIT_QCP_EXAMPLE_ALL(exampleFiles), { canPickMany: true });
  console.log('pickedFiles', pickedFiles);
  if (pickedFiles && pickedFiles.length > 0) {
    return {
      picked: pickedFiles.map(file => file.label),
      all: exampleFiles,
    };
  }
}
