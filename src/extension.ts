// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode'
import { ViewFiles } from './viewFiles'
import { ViewNodeInfo } from './viewNodeInfo'
import { IpfsApis } from './client/ipfsApis'
import { ViewPeersInfo } from './viewPeersInfo'
import { downloadIpfsDaemon, getNodeInfos, getPeersInfo, getViewFileInitData, initializeDaemon } from './methods'
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
const ipdetails = require('node-ip-details')

// import { create, globSource } from 'ipfs-http-client'
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "ipfs-vscode-extension" is now active!')

  const binPath = await downloadIpfsDaemon(context.globalStorageUri)
  const apiPath = initializeDaemon(binPath)

  const ipfsApis = new IpfsApis(apiPath)

  const nodeInfo = await getNodeInfos(ipfsApis)
  const { files, pinnedCids } = await getViewFileInitData(ipfsApis)
  const viewContents = await getPeersInfo(ipfsApis)

  new ViewNodeInfo(context, nodeInfo)
  new ViewPeersInfo(context, viewContents, ipfsApis)
  const viewFiles = new ViewFiles(context, files, pinnedCids, ipfsApis)

  //点开插件显示panel关闭插件时候记得set位false
  vscode.commands.executeCommand('setContext', 'showIpfsPanel', true)

  context.subscriptions.push(
    helloWorld,
    loadMorePeersInfo,
    uploadFile,
    shareLink,
    copyCid,
    setPinning(viewFiles, ipfsApis),
    unsetPinning(viewFiles, ipfsApis),
    openInWebView(nodeInfo.GateWay)
  )
}
