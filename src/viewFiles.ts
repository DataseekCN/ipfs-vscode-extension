import path from 'path'
import vscode, { TreeItem } from 'vscode'
import { IIpfsApis } from './client/ipfsApis'
import { getViewFileInitData } from './methods'

export class ViewFiles implements vscode.TreeDataProvider<IpfsFile> {
  dropMimeTypes = ['application/vnd.code.tree.ViewFiles']
  dragMimeTypes = ['text/uri-list']
  private _onDidChangeTreeData: vscode.EventEmitter<(IpfsFile | undefined)[] | undefined> = new vscode.EventEmitter<
    IpfsFile[] | undefined
  >()
  public onDidChangeTreeData: vscode.Event<any> = this._onDidChangeTreeData.event

  private files: IpfsFile[]
  private pinnedCids: string[]
  private ipfsApis: IIpfsApis

  constructor(private context: vscode.ExtensionContext, files: IpfsFile[], pinnedCids: string[], ipfsApis: IIpfsApis) {
    const view = vscode.window.createTreeView('ipfs-files', {
      treeDataProvider: this,
      showCollapseAll: true,
      canSelectMany: true,
      dragAndDropController: this
    })
    context.subscriptions.push(view)
    this.files = files
    this.pinnedCids = pinnedCids
    this.ipfsApis = ipfsApis
  }

  getTreeItem(element: IpfsFile): vscode.TreeItem | Thenable<vscode.TreeItem> {
    // Type 1 on behalf of folder
    const view = new TreeItem(
      `${element.Name} (${element.Hash})`,
      element.Type === 1 ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None
    )
    view.contextValue = element.Hash
    if (this.pinnedCids.includes(element.Hash)) {
      view.iconPath = {
        light: this.context.asAbsolutePath(path.join('assets', 'light', 'pin.svg')),
        dark: this.context.asAbsolutePath(path.join('assets', 'dark', 'pin.svg'))
      }
    }
    return view
  }

  getChildren(element?: IpfsFile): vscode.ProviderResult<IpfsFile[]> {
    if (!element) {
      return this.files
    }
    const children = this.ipfsApis.getFileByCid(element.Hash)
    if (children) {
      return children
    }
    return []
  }

  public async refresh(): Promise<any> {
    await this._reloadFileData()
    this._onDidChangeTreeData.fire(undefined)
  }

  private async _reloadFileData(): Promise<void> {
    const { files, pinnedCids } = await getViewFileInitData(this.ipfsApis)
    this.files = files
    this.pinnedCids = pinnedCids
  }
}
