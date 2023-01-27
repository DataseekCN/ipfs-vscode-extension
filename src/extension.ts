import vscode from 'vscode'
import { IpfsApis } from './client/ipfsApis'
import {
  copyCid,
  helloWorld,
  loadMorePeersInfo,
  openInWebView,
  openWebUi,
  setPinning,
  shareLink,
  startDaemon,
  stopDaemon,
  unsetPinning,
  uploadFile,
  uploadFileInExplorer
} from './commands'
import { DAEMONE_ON } from './constants'
import { initializeDaemon } from './ipfsDaemon'
import {
  downloadIpfsDaemon,
  getNodeInfos,
  getPeersInfo,
  getViewFileInitData,
  periodicRefreshPeersInfo,
  setDaemonStatus,
  setupCidDecorator
} from './methods'
import { createStatusBar } from './statusBar'
import { ViewFiles } from './viewFiles'
import { ViewLogPanel } from './viewLogPanel'
import { ViewNodeInfo } from './viewNodeInfo'
import { ViewPeersInfo } from './viewPeersInfo'

// import { create, globSource } from 'ipfs-http-client'
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "ipfs-vscode-extension" is now active!')

  vscode.commands.executeCommand('setContext', 'showLogPanel', true)

  const binPath = await downloadIpfsDaemon(context.globalStorageUri)
  const { api, gateway } = await initializeDaemon(binPath)
  await setDaemonStatus(context, DAEMONE_ON)

  setupCidDecorator(context)

  const ipfsApis = new IpfsApis(api)
  const { files, pinnedCids } = await getViewFileInitData(ipfsApis)
  const peersInfoAll = await ipfsApis.getPeersInfo()
  const viewContents = await getPeersInfo(ipfsApis, gateway, peersInfoAll, 20)

  const nodeInfo = await getNodeInfos(ipfsApis, context)
  nodeInfo['Peer Number'] = peersInfoAll.length

  new ViewLogPanel(context)
  const viewNodeInfo = new ViewNodeInfo(context, nodeInfo)
  const viewPeersInfo = new ViewPeersInfo(context, viewContents, ipfsApis, gateway)
  const viewFiles = new ViewFiles(context, files, pinnedCids, ipfsApis)

  periodicRefreshPeersInfo(ipfsApis, viewNodeInfo, viewPeersInfo)

  context.subscriptions.push(
    helloWorld,
    loadMorePeersInfo(viewPeersInfo),
    uploadFile(viewFiles, ipfsApis),
    shareLink,
    copyCid(),
    setPinning(viewFiles, ipfsApis),
    unsetPinning(viewFiles, ipfsApis),
    openInWebView(nodeInfo.GateWay),
    openWebUi(nodeInfo.API),
    stopDaemon(context, ipfsApis, viewNodeInfo),
    startDaemon(context, binPath, ipfsApis, viewNodeInfo, viewPeersInfo),
    uploadFileInExplorer(viewFiles, ipfsApis)
  )

  createStatusBar(context)
}

export async function deactivate(context: vscode.ExtensionContext) {
  console.log('deactivated')
  await vscode.commands.executeCommand('ipfs-vscode-extension.stopDaemon')
}
