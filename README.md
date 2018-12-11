# sfdc-qcp-vscode-extension README

This plugin improves the horrid developer experience for working with [Salesforce QCP Quote Calculator Plugin](https://developer.salesforce.com/docs/atlas.en-us.cpq_dev_plugins.meta/cpq_dev_plugins/cpq_plugins_parent.htm) scripts.

Say goodbye to copy-and-paste, say hello to VSCode!

![image](https://user-images.githubusercontent.com/5461649/49703193-40d7a600-fbbf-11e8-91bb-3a471e9a3591.png)

## Important Details
Locally, all files are saved as Typescript files, but there is no compilation so you will still need to write valid ES6 javascript instead.

The reason for this is because there are may times when someone else changes the remote file or a sandbox is refreshed, it would be nearly
impossible to pull the Javascript from SFDC and then turn that back into TypeScript.

In the future, it would be nice to have a "TypeScript mode" where the developers can truly be in bliss with TypeScript for development,
but that also means that the developer should never pull files down from SFDC, as they would be the JavaScript equivalent.

Your credentials will be stored as plaintext within a file in the created `.qcp` directory, but the extension creates or updates your `.gitignore` file to ensure this does not get committed to source control.

## Features

This plugin comes with the following core features:
- Connect to a Salesforce Org
- Create example QCP files in your project as examples
- Pull all existing QCP records from Salesforce
- Pull specific QCP records from Salesforce
- Push all locals files to Salesforce and create or update existing records on Salesforce
- Push specific local file to Salesforce
- Backup local files to directory
- Backup all remote files to directory

### Available Commands
- `SFDC QCP: Test org credentials`
  - Confirm org is valid
- `SFDC QCP: Initialize Project`
  - Create all project files as needed
  - Re-enter credentials for org
  - Create example files and pull all
- `SFDC QCP: Create example QCP files in your project`
  - Choose one or more examples files to add to your project (this overwrites any existing files with the same name)
- `SFDC QCP: Pull specified QCP file from SFDC`
  - Refresh a specific file that already exists locally
- `SFDC QCP: Pull all QCP files from Salesforce`
  - Pull all script files from Salesforce (this overwrites existing files with the same name)
- `SFDC QCP: Pull remote file from Salesforce`
  - Pull specific file from remote, even if it does not exist locally (this overwrites existing files with the same name)
- `SFDC QCP: Push file to Salesforce`
  - Choose file to push to Salesforce, which will create or update record on Salesforce
- `SFDC QCP: Push all files to Salesforce`
  - Push all files in project to Salesforce. This will update records that are included in `.qcp/qcp-config.json` (because we know the Id) and will create all other records on Salesforce.
- `SFDC QCP: Backup local or remote files`
  - Local
    - This will copy all files from `/src` to a new folder called `/{date}`
  - Remote
    - This will fetch all files from Salesforce and copy to a new folder called `/{date}`


### Project Initialization
**To get started, create a blank folder and open it with VSCode.**  You can use a folder with existing code if you want to.

Open the command pallette and type in `QCP` and choose `SFDC QCP: Initialize Project`.

When you initialize a new project, You will be required to enter your org type, username, password, and API token (if needed).
Your credential will be stored (in plain text for now) in a file named `.qcp/qcp-config.json`.

A `.gitignore` file will be created if one does not already exist and an entry for `.qcp` will be added to the file to ensure your credentials
are note submitted to source control.

The initialization will also create a `README.md` and `tsconfig.json` if they don't already exist.

Upon initialization, you will be asked if you want to pull all the files from Salesforce and optionally include example files locally.

## Requirements

- Salesforce Developer or Sandbox org.
- The Salesforce CPQ managed package must be installed installed.
- You must configure the CPQ Package level settings to choose which script to enable.

## Extension Settings

None for now.

## Known Issues

No known issues.

## Release Notes

### 0.1.1
- Added additional information on getting started (#6)
- Fixed typo in README (#7)

### 0.1.0
- Initial release of the Plugin

## Contributing
I plan to open source the project in the future, but until then, please ask questions on the [Extension Marketplace page for this extension](https://marketplace.visualstudio.com/items?itemName=paustint.sfdc-qcp-vscode-extension#qna).