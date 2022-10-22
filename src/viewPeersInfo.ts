import * as vscode from 'vscode'
import { TreeItem } from 'vscode'
import { IIpfsApis } from './client/ipfsApis'
import { ViewContent } from './types/viewPeersInfo'

export class ViewPeersInfo
  implements vscode.TreeDataProvider<ViewContent>, vscode.TreeDragAndDropController<ViewContent>
{
  dropMimeTypes = ['application/vnd.code.tree.ViewPeersInfo']
  dragMimeTypes = ['text/uri-list']
  private _onDidChangeTreeData: vscode.EventEmitter<(ViewContent | undefined)[] | undefined> = new vscode.EventEmitter<
    ViewContent[] | undefined
  >()
  // We want to use an array as the event type, but the API for this is currently being finalized. Until it's finalized, use any.
  public onDidChangeTreeData: vscode.Event<any> = this._onDidChangeTreeData.event

  private ipfsApis: IIpfsApis
  private viewContents: ViewContent[]

  constructor(context: vscode.ExtensionContext, viewContents: ViewContent[], ipfsApis: IIpfsApis) {
    const view = vscode.window.createTreeView('ipfs-peers', {
      treeDataProvider: this,
      showCollapseAll: true,
      canSelectMany: true,
      dragAndDropController: this
    })
    context.subscriptions.push(view)
    this.ipfsApis = ipfsApis
    this.viewContents = viewContents
  }

  getTreeItem(element: ViewContent): vscode.TreeItem | Thenable<vscode.TreeItem> {
    // Type 1 on behalf of folder
    return new TreeItem(
      element.content,
      element.isFather ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None
    )
  }

  getChildren(element?: ViewContent): vscode.ProviderResult<ViewContent[]> {
    if (!element) {
      return this.viewContents
    }
    const children = element.children
    return children ? children : []
  }
}
