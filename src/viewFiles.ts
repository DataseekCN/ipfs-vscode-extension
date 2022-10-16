import * as vscode from 'vscode'
import { TreeItem } from 'vscode'
import { IHttpClient } from './client/client'
import { IIpfsApis } from './client/ipfsApis'

export class ViewFiles implements vscode.TreeDataProvider<File>, vscode.TreeDragAndDropController<File> {
  dropMimeTypes = ['application/vnd.code.tree.ViewFiles']
  dragMimeTypes = ['text/uri-list']
  private _onDidChangeTreeData: vscode.EventEmitter<(File | undefined)[] | undefined> = new vscode.EventEmitter<
    File[] | undefined
  >()
  // We want to use an array as the event type, but the API for this is currently being finalized. Until it's finalized, use any.
  public onDidChangeTreeData: vscode.Event<any> = this._onDidChangeTreeData.event

  private files: File[]
  private ipfsApis: IIpfsApis

  constructor(context: vscode.ExtensionContext, files: File[], ipfsApis: IIpfsApis) {
    const view = vscode.window.createTreeView('ipfs-files', {
      treeDataProvider: this,
      showCollapseAll: true,
      canSelectMany: true,
      dragAndDropController: this
    })
    context.subscriptions.push(view)
    this.files = files
    this.ipfsApis = ipfsApis
  }

  getTreeItem(element: File): vscode.TreeItem | Thenable<vscode.TreeItem> {
    return new TreeItem(
      `${element.Name} (${element.Hash})`,
      element.Type === 1 ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None
    )
  }

  getChildren(element?: File): vscode.ProviderResult<File[]> {
    if (!element) {
      return this.files
    }
    const children = this.ipfsApis.getFileByCid(element.Hash)
    if (children) {
      return children
    }
    return []
  }
}
