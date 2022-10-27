import { IIpfsApis } from './client/ipfsApis'
import * as vscode from 'vscode'
import * as nodeFs from 'fs'
import nodePath = require('node:path')
import { execFile } from 'child_process'
import { getDownloadURL, unpack } from './download/newDownload'
import got from 'got'
import { Uri } from 'vscode'
import { IpApis } from './client/ipApis'
import { ViewContent } from './types/viewPeersInfo'
import countryCodeEmoji from 'country-code-emoji'
import { Daemon, NodeInfos, ViewFileInitData } from './types/methods'

export const downloadIpfsDaemon = async (globalStorageUri: Uri): Promise<string> => {
  const fs = vscode.workspace.fs
  const Uri = vscode.Uri

  // const bin = vscode.Uri.joinPath(globalStorageUri, 'ipfs/bin/go-ipfs')

  const exist = nodeFs.existsSync(globalStorageUri.path)

  if (!exist) {
    fs.createDirectory(globalStorageUri)
  }

  const downloadUri = Uri.joinPath(globalStorageUri, '/download')
  if (!nodeFs.existsSync(downloadUri.path)) {
    await fs.createDirectory(downloadUri)
  }

  console.log(downloadUri.path)
  const url = await getDownloadURL()
  const filename = url.split('/').pop()
  const filePath = `${downloadUri.path}/${filename}`

  if (!nodeFs.existsSync(filePath)) {
    // 这一步会很长 到时可以加个进度条
    nodeFs.writeFileSync(filePath, await got(url).buffer())
    // const goIpfs = await got(url)
    // await fs.writeFile(Uri.joinPath(globalStorageUri, '/bin/kubo'), goIpfs)
    console.log(url)
  }

  const binUri = Uri.joinPath(globalStorageUri, '/bin')
  const binName = 'ipfs'
  const binPath = nodePath.join(binUri.path, binName)
  if (!nodeFs.existsSync(binPath)) {
    await unpack(filePath, binPath)
  }
  return binPath
}

export const initializeDaemon = (binPath: string): Daemon => {
  const exePath = nodePath.join(binPath, 'kubo', 'ipfs')
  console.log('Initializing daemon...')
  const daemon = execFile(exePath, ['daemon', '--init'])
  const daemonOutput = vscode.window.createOutputChannel('IPFS Daemon')
  daemon.stdout?.on('data', (chunk) => daemonOutput.append(chunk))
  return { daemon, apiPath: 'http://127.0.0.1:5001/api/v0' }
}

export const getViewFileInitData = async (ipfsApis: IIpfsApis): Promise<ViewFileInitData> => {
  const rootCid = await ipfsApis.getFileRootCid()
  const files: File[] = await ipfsApis.getFileByCid(rootCid)
  const pinnedCids = await ipfsApis.getPinnedFile()
  vscode.commands.executeCommand('setContext', 'pinnedCids', pinnedCids)
  return {
    files,
    pinnedCids
  }
}

export const getNodeInfos = async (ipfsApis: IIpfsApis): Promise<NodeInfos> => {
  const nodeConfigs = await ipfsApis.getConfigs()
  const nodeId = await ipfsApis.getNodeId()
  const splitGateWay = nodeConfigs.Addresses.Gateway.split('/')
  return {
    'Node Status': 'Online',
    'Peer ID': nodeConfigs.Identity.PeerID,
    API: nodeConfigs.Addresses.API,
    GateWay: `http://${splitGateWay[2]}:${splitGateWay[4]}`,
    'Public Key': nodeId.PublicKey
  }
}

export const getPeersInfo = async (ipfsApis: IIpfsApis): Promise<ViewContent[]> => {
  const ipApis = new IpApis()
  const ipMap = new Map()
  const peersInfoAll = await ipfsApis.getPeersInfo()
  // const queryBatch = Math.trunc(peersInfoAll.length / 100)
  // for (let i = 0; i < queryBatch && i < 15; i++) {
  //   const peersInfo = peersInfoAll.slice(i * 100, i * 100 + 99)
  //   const ips: string[] = []
  //   peersInfo.forEach((peerInfo) => {
  //     ips.push(peerInfo.Addr.split('/')[2])
  //   })
  //   const ipsInfo = await ipApis.getIpInfo(ips)
  //   ipsInfo.forEach((ipInfo: { query: any }) => {
  //     ipMap.set(ipInfo.query, ipInfo)
  //   })
  // }
  const ips: string[] = []
  const peersInfo = peersInfoAll.slice(0, 99)
  peersInfo.forEach((peerInfo) => {
    ips.push(peerInfo.Addr.split('/')[2])
  })
  const ipsInfo = await ipApis.getIpInfo(ips)
  ipsInfo.forEach((ipInfo: { query: any }) => {
    ipMap.set(ipInfo.query, ipInfo)
  })
  const viewContents: ViewContent[] = []
  peersInfo.forEach(async (peerInfo) => {
    const ip = peerInfo.Addr.split('/')[2]

    const ipInfo = ipMap.get(ip)
    const emoj = ipInfo.status === 'success' ? countryCodeEmoji(ipInfo.countryCode) : '🌏'
    const children: ViewContent[] = []
    children.push({ content: `Location: ${ipInfo.country}, ${ipInfo.regionName}`, isFather: false })
    children.push({ content: `Latency: ${peerInfo.Latency}`, isFather: false })
    children.push({ content: `Peer ID: ${peerInfo.Peer}`, isFather: false })
    children.push({ content: `Connection: ${peerInfo.Addr}`, isFather: false })
    viewContents.push({ content: `${emoj} ${ipInfo.countryCode} (${peerInfo.Peer})`, isFather: true, children })
  })
  return viewContents
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
      <div id="wrap">
        <iframe src="${link}"></iframe>
      </div>
    </body>
    </html>`
}
