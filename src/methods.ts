import countryCodeEmoji from 'country-code-emoji'
import FormData, { AppendOptions } from 'form-data'
import fs from 'fs'
import glob from 'glob'
import got from 'got'
import path from 'path'
import Timer from 'setinterval'
import vscode, { Uri } from 'vscode'
import { IIpfsApis, IpfsApis } from './client/ipfsApis'
import { DAEMONE_OFF, DAEMONE_ON, DAEMON_STATUS } from './constants'
import { decorate } from './decorator'
import { initializeDaemon } from './ipfsDaemon'
import { getDownloadURL, unpack } from './lib/download'
import { lookup } from './lib/geoip'
import { updateStatusBarText } from './statusBar'
import { IpInfo } from './types/ipApis'
import { NodeInfos, ViewFileInitData } from './types/methods'
import { ViewContent } from './types/viewPeersInfo'
import { ViewFiles } from './viewFiles'
import { ViewNodeInfo } from './viewNodeInfo'
import { ViewPeersInfo } from './viewPeersInfo'

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
  let peersInfo: PeerInfo[]
  try {
    peersInfo = peersInfoAll.slice(0, loadNumber)
  } catch (e) {
    console.warn('faild to get peers info')
    peersInfo = []
  }
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
  viewPeersInfo: ViewPeersInfo
) => {
  const timer = new Timer(async () => {
    const peersInfoAll = await ipfsApis.getPeersInfo()
    await viewPeersInfo.refresh(peersInfoAll)
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

export const setDaemonStatus = async (context: vscode.ExtensionContext, status: string) => {
  await vscode.commands.executeCommand('setContext', DAEMON_STATUS, status)
  await context.globalState.update(DAEMON_STATUS, status)
  updateStatusBarText(status)
}

export const shutdownDaemon = async (
  context: vscode.ExtensionContext,
  ipfsApis: IIpfsApis,
  viewNodeInfo: ViewNodeInfo
) => {
  await ipfsApis.shutDown()
  viewNodeInfo.refreshIpfsStatus('Offline')
  vscode.window.showInformationMessage('Daemon stop successfully.')
  await setDaemonStatus(context, DAEMONE_OFF)
}

export const setupDaemon = async (
  context: vscode.ExtensionContext,
  binPath: string,
  ipfsApis: IIpfsApis,
  viewNodeInfo: ViewNodeInfo,
  viewPeersInfo: ViewPeersInfo
) => {
  await initializeDaemon(binPath)
  periodicRefreshPeersInfo(ipfsApis, viewNodeInfo, viewPeersInfo)
  await setDaemonStatus(context, DAEMONE_ON)
  viewNodeInfo.refreshIpfsStatus('Online')
  vscode.window.showInformationMessage('Daemon start successfully.')
}

export const setupCidDecorator = (context: vscode.ExtensionContext) => {
  vscode.workspace.onDidOpenTextDocument(() => decorate(context))
  vscode.workspace.onDidChangeTextDocument(() => decorate(context))
  vscode.window.onDidChangeVisibleTextEditors(() => decorate(context))
}

export const upLoadFile = async (fsPath: string, ipfsApis: IpfsApis, viewFiles: ViewFiles) => {
  const stat = fs.statSync(fsPath)
  if (stat.isDirectory()) {
    const formData = new FormData()
    const filenames = glob.sync('**/**', { cwd: fsPath })
    const dirName = path.basename(fsPath)
    console.log(dirName)
    if (filenames.length > 0) {
      for (const filename of filenames) {
        const filePath = `${fsPath}/${filename}`
        const filenameIPFS = toQueryString(`${dirName}/${filename}`)
        if (fs.statSync(filePath).isFile()) {
          const options: AppendOptions = {
            filename: filenameIPFS
          }
          console.log(filenameIPFS)
          formData.append(filenameIPFS, fs.readFileSync(filePath), options)
        }
      }
      await ipfsApis.upload({ formData, baseDir: dirName, isDir: true })
      console.log(`${dirName}文件夹上传成功`)
    }
  } else if (stat.isFile()) {
    const formData = new FormData()
    const filename = path.basename(fsPath)
    const options: AppendOptions = {
      filename
    }
    formData.append(filename, fs.readFileSync(fsPath), options)
    console.log(filename)
    await ipfsApis.upload({ formData: formData })
    console.log(`${filename}文件上传成功`)
  } else {
    throw new Error('something wrong with the file system')
  }
  await viewFiles.refresh()
  vscode.window.showInformationMessage(fsPath)
}

function toQueryString(str: string) {
  return str.replaceAll('/', '%2F')
}
