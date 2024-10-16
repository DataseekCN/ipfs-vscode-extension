import vscode from 'vscode'
import { IIpfsApis, IpfsApis } from './client/ipfsApis'
import logger from './logger'
import { getWebviewContent, setupDaemon, shutdownDaemon, upLoadFile } from './methods'
import { ViewFiles } from './viewFiles'
import { ViewNodeInfo } from './viewNodeInfo'
import { ViewPeersInfo } from './viewPeersInfo'

export const helloWorld = vscode.commands.registerCommand('ipfs-vscode-extension.helloWorld', () => {
  vscode.window.showInformationMessage('Hello World!!!!')
})

export const uploadFile = (viewFiles: ViewFiles, ipfsApis: IpfsApis) =>
  vscode.commands.registerCommand('ipfs-vscode-extension.uploadFile', () => {
    // more select options see here
    const options: vscode.OpenDialogOptions = {
      canSelectFolders: true,
      canSelectFiles: true
    }
    vscode.window.showOpenDialog(options).then(async (fileUri) => {
      if (fileUri && fileUri[0]) {
        await upLoadFile(fileUri[0].fsPath, ipfsApis, viewFiles)
      }
    })
  })

export const shareLink = vscode.commands.registerCommand('ipfs-vscode-extension.shareLink', (args: IpfsFile) => {
  const shareLink = `https://ipfs.io/ipfs/${args.Hash}?filename=${args.Name}`
  vscode.env.clipboard.writeText(shareLink)
  vscode.window.showInformationMessage(`Copy link completed! Links is : ${shareLink}`)
})

export const copyCid = () =>
  vscode.commands.registerCommand('ipfs-vscode-extension.copyCid', (args: IpfsFile) => {
    const cid = args.Hash
    vscode.env.clipboard.writeText(cid)
    vscode.window.showInformationMessage(`Copy CID completed! CID is : ${cid}`)
    logger.log('ipfs', `Copy CID completed! CID is : ${cid}`)
  })

export const openInWebView = (gateway: string) =>
  vscode.commands.registerCommand('ipfs-vscode-extension.openInWebView', (args: IpfsFile) => {
    const fileLink = `${gateway}/ipfs/${args.Hash}?filename=${args.Name}`
    const panel = vscode.window.createWebviewPanel('Webview', args.Name, vscode.ViewColumn.One, {
      enableScripts: true,
      retainContextWhenHidden: true
    })
    panel.webview.html = getWebviewContent(fileLink)
  })

export const setPinning = (viewFiles: ViewFiles, ipfsApis: IIpfsApis) =>
  vscode.commands.registerCommand('ipfs-vscode-extension.setPinning', async (args: IpfsFile) => {
    const cid = args.Hash
    await ipfsApis.setPinning(cid)
    await viewFiles.refresh()
    vscode.window.showInformationMessage(`Set pinning successfully! CID is : ${cid}`)
  })

export const unsetPinning = (viewFiles: ViewFiles, ipfsApis: IIpfsApis) =>
  vscode.commands.registerCommand('ipfs-vscode-extension.unsetPinning', async (args: IpfsFile) => {
    const cid = args.Hash
    await ipfsApis.unsetPinng(cid)
    await viewFiles.refresh()
    vscode.window.showInformationMessage(`Unset pinning successfully! CID is : ${cid}`)
  })

export const loadMorePeersInfo = (viewPeersInfo: ViewPeersInfo) =>
  vscode.commands.registerCommand('ipfs-vscode-extension.loadMore', async () => {
    viewPeersInfo.refreshLoadMore()
  })

export const openWebUi = (apiPath: string) =>
  vscode.commands.registerCommand('ipfs-vscode-extension.showWebUi', () => {
    const apiPort = apiPath.split('/')[4]
    const webUiLink = `http://127.0.0.1:${apiPort}/webui`
    const panel = vscode.window.createWebviewPanel('Webview', 'IPFS Web UI', vscode.ViewColumn.One, {
      enableScripts: true,
      retainContextWhenHidden: true
    })
    panel.webview.html = getWebviewContent(webUiLink)
  })

export const stopDaemon = (context: vscode.ExtensionContext, ipfsApis: IIpfsApis, viewNodeInfo: ViewNodeInfo) =>
  vscode.commands.registerCommand('ipfs-vscode-extension.stopDaemon', async () =>
    shutdownDaemon(context, ipfsApis, viewNodeInfo)
  )

export const startDaemon = (
  context: vscode.ExtensionContext,
  binPath: string,
  ipfsApis: IIpfsApis,
  viewNodeInfo: ViewNodeInfo,
  viewPeersInfo: ViewPeersInfo
) =>
  vscode.commands.registerCommand('ipfs-vscode-extension.startDaemon', async () =>
    setupDaemon(context, binPath, ipfsApis, viewNodeInfo, viewPeersInfo)
  )

export const uploadFileInExplorer = (viewFiles: ViewFiles, ipfsApis: IpfsApis) =>
  vscode.commands.registerCommand(
    'ipfs-vscode-extension.uploadFileInExplorer',
    async (uri) => await upLoadFile(uri.path, ipfsApis, viewFiles)
  )
