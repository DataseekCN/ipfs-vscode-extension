import * as vscode from 'vscode'
import * as path from 'path'
import { TreeItem } from 'vscode'
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
  private pinnedCids: string[]
  private ipfsApis: IIpfsApis

  constructor(private context: vscode.ExtensionContext, files: File[], pinnedCid: string[], ipfsApis: IIpfsApis) {
    const view = vscode.window.createTreeView('ipfs-files', {
      treeDataProvider: this,
      showCollapseAll: true,
      canSelectMany: true,
      dragAndDropController: this
    })
    context.subscriptions.push(view)
    this.files = files
    this.pinnedCids = pinnedCid
    this.ipfsApis = ipfsApis
  }

  getTreeItem(element: File): vscode.TreeItem | Thenable<vscode.TreeItem> {
    // Type 1 on behalf of folder
    const view = new TreeItem(
      `${element.Name} (${element.Hash})`,
      element.Type === 1 ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None
    )
    view.contextValue = element.Hash
    if (this.pinnedCids.includes(element.Hash)) {
      view.iconPath = {
        light: this.context.asAbsolutePath(path.join('src', 'assets', 'light', 'pin.svg')),
        dark: this.context.asAbsolutePath(path.join('src', 'assets', 'dark', 'pin.svg'))
      }
    }
    return view
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
