import * as vscode from 'vscode'
import { TreeItem } from 'vscode'

export class ViewFiles implements vscode.TreeDataProvider<File>, vscode.TreeDragAndDropController<File> {
  dropMimeTypes = ['application/vnd.code.tree.ViewFiles']
  dragMimeTypes = ['text/uri-list']
  private _onDidChangeTreeData: vscode.EventEmitter<(File | undefined)[] | undefined> = new vscode.EventEmitter<
    File[] | undefined
  >()
  // We want to use an array as the event type, but the API for this is currently being finalized. Until it's finalized, use any.
  public onDidChangeTreeData: vscode.Event<any> = this._onDidChangeTreeData.event

  private files: File[]

  constructor(context: vscode.ExtensionContext, files: any[]) {
    const view = vscode.window.createTreeView('ipfs-files', {
      treeDataProvider: this,
      showCollapseAll: true,
      canSelectMany: true,
      dragAndDropController: this
    })
    context.subscriptions.push(view)
    this.files = files
  }

  getTreeItem(element: File): vscode.TreeItem | Thenable<vscode.TreeItem> {
    return new TreeItem(
      `${element.fileName} (${element.cid})`,
      element.children !== undefined ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None
    )
  }
  getChildren(element?: File): vscode.ProviderResult<File[]> {
    if (!element) {
      return this.files
    }
    const children = element.children
    if (children) {
      return children
    }
    return []
  }
}
