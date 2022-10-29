// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode'
import { IpfsApis } from './client/ipfsApis'
import {
  copyCid,
  helloWorld,
  loadMorePeersInfo,
  openInWebView,
  setPinning,
  shareLink,
  unsetPinning,
  uploadFile
} from './commands'
import { initializeDaemon } from './ipfsDaemon'
import { downloadIpfsDaemon, getNodeInfos, getPeersInfo, getViewFileInitData } from './methods'
import { ViewFiles } from './viewFiles'
import { ViewNodeInfo } from './viewNodeInfo'
import { ViewPeersInfo } from './viewPeersInfo'
import { ViewStdout } from './viewStdout'

// import { create, globSource } from 'ipfs-http-client'
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "ipfs-vscode-extension" is now active!')
  //点开插件显示panel关闭插件时候记得set位false
  vscode.commands.executeCommand('setContext', 'showIpfsPanel', true)

  const binPath = await downloadIpfsDaemon(context.globalStorageUri)
  const { daemon, api } = await initializeDaemon(binPath)

  const ipfsApis = new IpfsApis(api)

  const nodeInfo = await getNodeInfos(ipfsApis)
  const { files, pinnedCids } = await getViewFileInitData(ipfsApis)
  const viewContents = await getPeersInfo(ipfsApis)

  new ViewStdout(context, daemon)
  new ViewNodeInfo(context, nodeInfo)
  new ViewPeersInfo(context, viewContents, ipfsApis)
  const viewFiles = new ViewFiles(context, files, pinnedCids, ipfsApis)

  context.subscriptions.push(
    helloWorld,
    loadMorePeersInfo,
    uploadFile(viewFiles, ipfsApis),
    shareLink,
    copyCid,
    setPinning(viewFiles, ipfsApis),
    unsetPinning(viewFiles, ipfsApis),
    openInWebView(nodeInfo.GateWay)
  )
}
