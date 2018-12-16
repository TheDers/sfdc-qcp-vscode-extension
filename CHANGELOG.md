# Change Log

### 0.2.3
**12-16-2018**
- Fixed type error in example `qcp-example-true-end-date-and-sub-term.ts`.
- Fixed bug with invalid credentials with viewing unsaved records from Salesforce.
- Initialize project is the only shown menu option for projects that do not have the qcp configuration file in the workspace.
- Published [blog article](https://medium.com/@paustint/getting-started-with-the-salesforce-cpq-quote-calculator-plugin-vscode-extension-718306ff40d4).

### 0.2.2
**12-15-2018**
- Modified extension icon.

### 0.2.1
**12-15-2018**
- Added extension icon.
- Updated theme.
- Updated extension description.
- If a local file is created and pushed, and a record in Salesforce with the same name exists, that record will be used and overwritten.
- Added command to view record in Salesforce without pulling the record data to a local file.

### 0.2.0
**12-15-2018**
- Updated changelog file. (#9)
- Misc code cleanup.
- Pushing files now allows selecting multiple files instead of just one or all. (#3)
- When pulling files, a prompt with various actions is presented to the user before overwriting local records. (#15)
- Added a log file in the `.qcp` directory to show a history of what was pushed and pulled. (#14)
- Added ability to push files when they are saved, which includes a user confirmation. (#13)
- Updated background on the Marketplace. (#10)
- Updated extension display name to `Salesforce CPQ - Quote Calculator Plugin`. (#10)
- On initialize, if an org is already configured, then there is an option to skip re-initializing the org and just re-create any config files.
- Added prettier configuration file creation with project initialization. (#11)
- Added command to get diff from files or records.
- Added settings:
  - `sfdcQcp.pushOnSave` - When a file is saved, show prompt asking if file should be pushed to Salesforce.
  - `sfdcQcp.saveLog` - Determines if a log file should be saved each time a record from Salesforce is pushed or pulled.
  - `sfdcQcp.maxLogEntries` - Determines the maximum number of entries in the log file.
  - `sfdcQcp.prettier` - Determines if a .prettierrc file will be created on project initialization.
  - `prettierConfig` - Default [prettier configuration](https://prettier.io/docs/en/configuration.html) object. You must edit this configuration in JSON mode.

### 0.1.1
**12-09-2018**
- Added additional information on getting started. (#6)
- Fixed typo in README. (#7)

### 0.1.0
**12-08-2018**
- Initial release of the Plugin.