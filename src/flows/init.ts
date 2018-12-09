import { QuickPickItem, window } from 'vscode';
import { INPUT_OPTIONS } from '../constants';
import { OrgInfo, OrgType } from '../models';
import * as _ from 'lodash';

/**
 * Get credentials
 */
export async function createConfig(orgInfo: OrgInfo): Promise<OrgInfo | undefined> {
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
    switch (orgInfo.orgType) {
      case 'Sandbox': {
        return 'https://test.salesforce.com';
      }
      case 'Custom URL': {
        return await window.showInputBox(INPUT_OPTIONS.INIT_ORG_TYPE_CUSTOM_INPUT(orgInfo.username));
      }
      default: {
        return 'https://login.salesforce.com';
      }
    }
  }
}
