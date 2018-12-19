# sfdc-qcp-vscode-extension README

This plugin improves the developer experience when working with [Salesforce QCP Quote Calculator Plugin](https://developer.salesforce.com/docs/atlas.en-us.cpq_dev_plugins.meta/cpq_dev_plugins/cpq_plugins_parent.htm) scripts.

Say goodbye to copy-and-paste, say hello to VSCode!

![commands](https://user-images.githubusercontent.com/5461649/50048985-45a4ca00-0097-11e9-9c39-5e1c3499f6ba.png)

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
- `SFDC QCP: Pull specific QCP file from SFDC`
  - Refresh a specific file that already exists locally
- `SFDC QCP: Pull all QCP files from Salesforce`
  - Pull all script files from Salesforce (this overwrites existing files with the same name)
- `SFDC QCP: Pull remote file from Salesforce`
  - Pull specific file from remote, even if it does not exist locally (this overwrites existing files with the same name)
- `SFDC QCP: Push files to Salesforce`
  - Choose one or more file sto push to Salesforce, which will create or update records in Salesforce
- `SFDC QCP: Push all files to Salesforce`
  - Push all files in project to Salesforce. This will update records that are included in `.qcp/qcp-config.json` (because we know the Id) and will create all other records on Salesforce.
- `SFDC QCP: Backup local or remote files`
  - Local
    - This will copy all files from `/src` to a new folder called `/{date}`
  - Remote
    - This will fetch all files from Salesforce and copy to a new folder called `/{date}`
- `SFDC QCP: Compare Records and show differences`
  - Shows differences between a file and a record
- `SFDC QCP: Open QCP record from Salesforce`
  - Opens a QCP record from Salesforce without saving the file locally

### Project Initialization
**To get started, create a blank folder and open it with VSCode.**  You can use a folder with existing code if you want to.

Open the command pallette and type in `QCP` and choose `SFDC QCP: Initialize Project`.  All other options will be hidden until the project is initialized.

When you initialize a new project, You will be required to enter your org type, username, password, and API token (if needed).
Your credential will be stored (in plain text for now) in a file named `.qcp/qcp-config.json`.

A `.gitignore` file will be created if one does not already exist and an entry for `.qcp` will be added to the file to ensure your credentials
are note submitted to source control.

The initialization will also create a `README.md` and `tsconfig.json` if they don't already exist.

Optionally, a `.prettierrc` file will be created during initialization. This can be configured in the extension settings.

Upon initialization, you will be asked if you want to pull all the files from Salesforce and optionally include example files locally.

## Requirements

- Salesforce Developer or Sandbox org.
- The Salesforce CPQ managed package must be installed installed.
- You must configure the CPQ Package level settings to choose which script to enable.

## Extension Settings

- `sfdcQcp.pushOnSave` - When a file is saved, show prompt asking if file should be pushed to Salesforce
- `sfdcQcp.prettier` - Determines if a .prettierrc file will be created on project initialization
- `sfdcQcp.saveLog` - Determines if a log file should be saved each time a record from Salesforce is pushed or pulled
- `sfdcQcp.maxLogEntries` - Determines the maximum number of entries in the log file.

## Known Issues

No known issues.

## Release Notes

Check out my [Medium article](https://medium.com/@paustint/getting-started-with-the-salesforce-cpq-quote-calculator-plugin-vscode-extension-718306ff40d4) on using the extension.

See changes in Changelog.

## Contributing
Contributions of all kinds will be considered. https://github.com/atginfo/sfdc-qcp-vscode-extension