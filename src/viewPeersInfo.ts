import * as vscode from 'vscode'
import { TreeItem } from 'vscode'
import { IIpfsApis } from './client/ipfsApis'
import { getPeersInfo } from './methods'
import { ViewContent } from './types/viewPeersInfo'

export class ViewPeersInfo implements vscode.TreeDataProvider<ViewContent> {
  dropMimeTypes = ['application/vnd.code.tree.ViewPeersInfo']
  dragMimeTypes = ['text/uri-list']
  private _onDidChangeTreeData: vscode.EventEmitter<(ViewContent | undefined)[] | undefined> = new vscode.EventEmitter<
    ViewContent[] | undefined
  >()
  public onDidChangeTreeData: vscode.Event<any> = this._onDidChangeTreeData.event

  private ipfsApis: IIpfsApis
  private viewContents: ViewContent[]
  private gateway: string
  private queryNumber: number
  private batchNumber: number

  constructor(context: vscode.ExtensionContext, viewContents: ViewContent[], ipfsApis: IIpfsApis, gateway: string) {
    const view = vscode.window.createTreeView('ipfs-peers', {
      treeDataProvider: this,
      showCollapseAll: true,
      canSelectMany: true,
      dragAndDropController: this
    })
    context.subscriptions.push(view)
    this.ipfsApis = ipfsApis
    this.viewContents = viewContents
    this.gateway = gateway
    this.queryNumber = 20
    this.batchNumber = 20
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

  public async refresh(): Promise<any> {
    await this._reloadPeersInfo()
    this._onDidChangeTreeData.fire(undefined)
  }

  private async _reloadPeersInfo(): Promise<void> {
    this.queryNumber = this.queryNumber + this.batchNumber
    this.viewContents = await getPeersInfo(this.ipfsApis, this.gateway, this.queryNumber)
  }
}
