import countryCodeEmoji from 'country-code-emoji'
import fs from 'fs'
import got from 'got'
import path from 'path'
import Timer from 'setinterval'
import vscode, { Uri } from 'vscode'
import { IIpfsApis } from './client/ipfsApis'
import { DAEMONE_OFF, DAEMONE_ON, DAEMON_STATUS } from './constants'
import { decorate } from './decorator'
import { initializeDaemon } from './ipfsDaemon'
import { getDownloadURL, unpack } from './lib/download'
import { lookup } from './lib/geoip'
import { IpInfo } from './types/ipApis'
import { NodeInfos, ViewFileInitData } from './types/methods'
import { ViewContent } from './types/viewPeersInfo'
import { ViewNodeInfo } from './viewNodeInfo'
import { ViewPeersInfo } from './viewPeersInfo'
import { ViewStdout } from './viewStdout'

export const downloadIpfsDaemon = async (globalStorageUri: Uri): Promise<string> => {
  const exist = fs.existsSync(globalStorageUri.path)

  if (!exist) {
    vscode.workspace.fs.createDirectory(globalStorageUri)
  }

  const downloadUri = Uri.joinPath(globalStorageUri, '/download')
  if (!fs.existsSync(downloadUri.path)) {
    await vscode.workspace.fs.createDirectory(downloadUri)
  }

  console.log(downloadUri.path)
  const url = await getDownloadURL()
  const filename = url.split('/').pop()
  const filePath = `${downloadUri.path}/${filename}`

  if (!fs.existsSync(filePath)) {
    // 这一步会很长 到时可以加个进度条
    fs.writeFileSync(filePath, await got(url).buffer())
    // const goIpfs = await got(url)
    // await fs.writeFile(Uri.joinPath(globalStorageUri, '/bin/kubo'), goIpfs)
    console.log(url)
  }

  const binUri = Uri.joinPath(globalStorageUri, '/bin')
  const binName = 'ipfs'
  const binPath = path.join(binUri.path, binName)
  if (!fs.existsSync(binPath)) {
    await unpack(filePath, binPath)
  }
  return binPath
}

export const getViewFileInitData = async (ipfsApis: IIpfsApis): Promise<ViewFileInitData> => {
  const rootCid = await ipfsApis.getFileRootCid()
  const files: IpfsFile[] = await ipfsApis.getFileByCid(rootCid)
  const pinnedCids = await ipfsApis.getPinnedFile()
  vscode.commands.executeCommand('setContext', 'pinnedCids', pinnedCids)
  return {
    files,
    pinnedCids
  }
}

export const getNodeInfos = async (ipfsApis: IIpfsApis, context: vscode.ExtensionContext): Promise<NodeInfos> => {
  const nodeConfigs = await ipfsApis.getConfigs()
  const nodeId = await ipfsApis.getNodeId()
  const splitGateWay = nodeConfigs.Addresses.Gateway.split('/')
  const daemonStatus = context.globalState.get(DAEMON_STATUS)
  return {
    'Node Status': daemonStatus == DAEMONE_ON ? 'Online' : 'Offline',
    'Peer ID': nodeConfigs.Identity.PeerID,
    API: nodeConfigs.Addresses.API,
    GateWay: `http://${splitGateWay[2]}:${splitGateWay[4]}`,
    'Public Key': nodeId.PublicKey
  }
}

export const getPeersInfo = async (
  ipfsApis: IIpfsApis,
  ipfsGateway: string,
  peersInfoAll: PeerInfo[],
  loadNumber: number
): Promise<ViewContent[]> => {
  const peersInfo = peersInfoAll.slice(0, loadNumber)
  return await Promise.all(
    peersInfo.map(async (peerInfo) => {
      const ip = peerInfo.Addr.split('/')[2]
      const ipInfo: IpInfo = await lookup(ipfsGateway, ip).catch(() => ({
        status: 'failed',
        country: 'Unknown',
        countryCode: 'Unknown',
        city: 'Unknown'
      }))
      const emoj =
        ipInfo.status === 'success' && ipInfo.countryCode.length === 2 ? countryCodeEmoji(ipInfo.countryCode) : '🌏'
      const children: ViewContent[] = [
        { content: `Location: ${ipInfo.country || 'Unknown'}, ${ipInfo.city || 'Unknown'}`, isFather: false },
        { content: `Latency: ${peerInfo.Latency}`, isFather: false },
        { content: `Peer ID: ${peerInfo.Peer}`, isFather: false },
        { content: `Connection: ${peerInfo.Addr}`, isFather: false }
      ]
      return { content: `${emoj} ${ipInfo.countryCode || 'Unknown'} (${peerInfo.Peer})`, isFather: true, children }
    })
  )
}

export const getWebviewContent = (link: String) => {
  return `<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>View File</title>
      <style>
        html,body,iframe{width: 100%;height: 100%;padding: 0;margin: 0}
        #wrap{width: 100%;height: 100%;}
        iframe{border: none;}
      </style>
    </head>
    <body>
      <iframe src="${link}"></iframe>
    </body>
    </html>
  `
}

export const periodicRefreshPeersInfo = (
  ipfsApis: IIpfsApis,
  viewNodeInfo: ViewNodeInfo,
  viewPeersInfo: ViewPeersInfo,
  viewStdout: ViewStdout
) => {
  const timer = new Timer(async () => {
    const peersInfoAll = await ipfsApis.getPeersInfo()
    await viewPeersInfo.refresh(peersInfoAll, viewStdout)
    viewNodeInfo.refreshPeerNubmber(peersInfoAll.length)
  }, 5000)
  // start timer
  timer.setInterval()
}

export const handleTimeString = (timeString: string): number => {
  if (timeString === 'n/a') {
    return 9999999
  }
  return timeString.endsWith('ms') ? parseFloat(timeString) : parseFloat(timeString) * 1000
}

export const setDaemonStatus = (context: vscode.ExtensionContext, status: string) => {
  vscode.commands.executeCommand('setContext', DAEMON_STATUS, status)
  context.globalState.update(DAEMON_STATUS, status)
}

export const shutDownDaemon = async (
  context: vscode.ExtensionContext,
  ipfsApis: IIpfsApis,
  viewNodeInfo: ViewNodeInfo
) => {
  await ipfsApis.shutDown()
  viewNodeInfo.refreshIpfsStatus('Offline')
  vscode.window.showInformationMessage('Daemon stop successfully.')
  setDaemonStatus(context, DAEMONE_OFF)
}

export const setUpDaemon = async (
  context: vscode.ExtensionContext,
  binPath: string,
  ipfsApis: IIpfsApis,
  viewNodeInfo: ViewNodeInfo,
  viewPeersInfo: ViewPeersInfo,
  viewStdout: ViewStdout
) => {
  await initializeDaemon(binPath)
  periodicRefreshPeersInfo(ipfsApis, viewNodeInfo, viewPeersInfo, viewStdout)
  setDaemonStatus(context, DAEMONE_ON)
  viewNodeInfo.refreshIpfsStatus('Online')
  vscode.window.showInformationMessage('Daemon start successfully.')
}

export const setUpCidDetactor = (context: vscode.ExtensionContext) => {
  vscode.workspace.onDidOpenTextDocument(() => decorate(context))
  vscode.workspace.onDidChangeTextDocument(() => decorate(context))
  vscode.window.onDidChangeVisibleTextEditors(() => decorate(context))
}
