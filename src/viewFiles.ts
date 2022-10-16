import * as vscode from 'vscode'
import { TreeItem } from 'vscode'

export class ViewFiles implements vscode.TreeDataProvider<MockFile>, vscode.TreeDragAndDropController<MockFile> {
  dropMimeTypes = ['application/vnd.code.tree.ViewFiles']
  dragMimeTypes = ['text/uri-list']
  private _onDidChangeTreeData: vscode.EventEmitter<(MockFile | undefined)[] | undefined> = new vscode.EventEmitter<
    MockFile[] | undefined
  >()
  // We want to use an array as the event type, but the API for this is currently being finalized. Until it's finalized, use any.
  public onDidChangeTreeData: vscode.Event<any> = this._onDidChangeTreeData.event

  private files: MockFile[]

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

  getTreeItem(element: MockFile): vscode.TreeItem | Thenable<vscode.TreeItem> {
    return new TreeItem(
      `${element.fileName} (${element.cid})`,
      element.children !== undefined ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None
    )
  }
  getChildren(element?: MockFile): vscode.ProviderResult<MockFile[]> {
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
