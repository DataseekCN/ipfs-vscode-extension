import * as vscode from 'vscode'
import { TreeItem } from 'vscode'

export class ViewNodeInfo implements vscode.TreeDataProvider<TreeItem>, vscode.TreeDragAndDropController<TreeItem> {
  dropMimeTypes = ['application/vnd.code.tree.ViewNodeInfo']
  dragMimeTypes = ['text/uri-list']
  private _onDidChangeTreeData: vscode.EventEmitter<(TreeItem | undefined)[] | undefined> = new vscode.EventEmitter<
    TreeItem[] | undefined
  >()
  // We want to use an array as the event type, but the API for this is currently being finalized. Until it's finalized, use any.
  public onDidChangeTreeData: vscode.Event<any> = this._onDidChangeTreeData.event

  private nodeInfo: any

  constructor(context: vscode.ExtensionContext, nodeInfo: any) {
    const view = vscode.window.createTreeView('ipfs-node-info', {
      treeDataProvider: this,
      showCollapseAll: true,
      canSelectMany: true,
      dragAndDropController: this
    })
    context.subscriptions.push(view)
    this.nodeInfo = nodeInfo
  }

  getTreeItem(element: TreeItem): vscode.TreeItem | Thenable<vscode.TreeItem> {
    return element
  }
  getChildren(element?: TreeItem): vscode.ProviderResult<TreeItem[]> {
    let viewInfo: TreeItem[] = []
    Object.keys(this.nodeInfo).forEach((value) =>
      viewInfo.push(new TreeItem(`${value}: ${this.nodeInfo[value]}`, vscode.TreeItemCollapsibleState.None))
    )
    return viewInfo
  }
}
