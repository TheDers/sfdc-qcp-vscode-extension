import * as jsforce from 'jsforce';
import { TextDocumentContentProvider, EventEmitter, Uri, Event } from 'vscode';
import { queryRecordsById } from '../common/sfdc-utils';

export class SfdcTextDocumentProvider implements TextDocumentContentProvider {
  private _onDidChange = new EventEmitter<Uri>();

  constructor(private conn: jsforce.Connection) {}

  public async provideTextDocumentContent(uri: Uri): Promise<string> {
    const records = await queryRecordsById(this.conn, uri.fragment);
    if (records && records[0]) {
      return records[0].SBQQ__Code__c;
    }
    throw new Error(`A record with Id ${uri.path} was not found on Salesforce.`);
  }

  get onDidChange(): Event<Uri> {
    return this._onDidChange.event;
  }

  public update(uri: Uri) {
    this._onDidChange.fire(uri);
  }
}
