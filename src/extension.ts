'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { QcpExtension } from './qcp-extension';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "sfdc-qcp-vscode-extension" is now active!');

  const qcp = new QcpExtension();

  context.subscriptions.push(
    vscode.commands.registerCommand('extension.init', () => {
      console.log('Initializing new project');
      qcp.init();
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('extension.pull', () => {
      qcp.pullFile();
    }),
  );
  context.subscriptions.push(
    vscode.commands.registerCommand('extension.pullAll', () => {
      qcp.pullFiles();
    }),
  );
  context.subscriptions.push(
    vscode.commands.registerCommand('extension.push', () => {
      qcp.pushFile();
    }),
  );
  context.subscriptions.push(
    vscode.commands.registerCommand('extension.pushAll', () => {
      qcp.pushAllFiles();
    }),
  );
}

// this method is called when your extension is deactivated
export function deactivate() {}
