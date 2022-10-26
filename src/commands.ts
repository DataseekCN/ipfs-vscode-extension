import * as vscode from 'vscode'
import * as nodeFs from 'fs'
import { getWebviewContent } from './methods'
import { ViewFiles } from './viewFiles'
import { IIpfsApis, IpfsApis } from './client/ipfsApis'

export const helloWorld = vscode.commands.registerCommand('ipfs-vscode-extension.helloWorld', () => {
  vscode.window.showInformationMessage('Hello World!!!!')
})

export const uploadFile = vscode.commands.registerCommand('ipfs-vscode-extension.uploadFile', () => {
  // more select options see here
  const options: vscode.OpenDialogOptions = {
    canSelectFolders: true
  }
  vscode.window.showOpenDialog(options).then(async (fileUri) => {
    if (fileUri && fileUri[0]) {
      const stat = nodeFs.statSync(fileUri[0].fsPath)
      if (stat.isDirectory()) {
      } else if (stat.isFile()) {
        // const ipfs = await create()
        // const file = await ipfs.addAll(globSource())
        // console.log(file)
        // ipfsApis.upload(fileUri[0].fsPath)
      } else {
        throw new Error('something wrong with the file system')
      }

      vscode.window.showInformationMessage(fileUri[0].fsPath)
    }
  })
})

export const shareLink = vscode.commands.registerCommand('ipfs-vscode-extension.shareLink', (args: File) => {
  const shareLink = `https://ipfs.io/ipfs/${args.Hash}?filename=${args.Name}`
  vscode.env.clipboard.writeText(shareLink)
  vscode.window.showInformationMessage(`Copy link completed! Links is : ${shareLink}`)
})

export const copyCid = vscode.commands.registerCommand('ipfs-vscode-extension.copyCid', (args: File) => {
  const cid = args.Hash
  vscode.env.clipboard.writeText(cid)
  vscode.window.showInformationMessage(`Copy CID completed! CID is : ${cid}`)
})

export const openInWebView = (gateWay: string) =>
  vscode.commands.registerCommand('ipfs-vscode-extension.openInWebView', (args: File) => {
    const fileLink = `${gateWay}/ipfs/${args.Hash}?filename=${args.Name}`
    const panel = vscode.window.createWebviewPanel('Webview', args.Name, vscode.ViewColumn.One, {
      enableScripts: true,
      retainContextWhenHidden: true
    })
    panel.webview.html = getWebviewContent(fileLink)
  })

export const setPinning = (viewFiles: ViewFiles, ipfsApis: IIpfsApis) =>
  vscode.commands.registerCommand('ipfs-vscode-extension.setPinning', async (args: File) => {
    const cid = args.Hash
    await ipfsApis.setPinning(cid)
    await viewFiles.refresh()
    vscode.window.showInformationMessage(`Set pinning successfully! CID is : ${cid}`)
  })

export const unsetPinning = (viewFiles: ViewFiles, ipfsApis: IIpfsApis) =>
  vscode.commands.registerCommand('ipfs-vscode-extension.unsetPinning', async (args: File) => {
    const cid = args.Hash
    await ipfsApis.unsetPinng(cid)
    await viewFiles.refresh()
    vscode.window.showInformationMessage(`Unset pinning successfully! CID is : ${cid}`)
  })

export const loadMorePeersInfo = vscode.commands.registerCommand('ipfs-vscode-extension.loadMore', async () => {
  vscode.window.showInformationMessage('Will load more peers info')
})
