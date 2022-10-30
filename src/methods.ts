import countryCodeEmoji from 'country-code-emoji'
import * as nodeFs from 'fs'
import got from 'got'
import * as vscode from 'vscode'
import { Uri } from 'vscode'
import { IIpfsApis } from './client/ipfsApis'
import { getDownloadURL, unpack } from './download/newDownload'
import { lookup } from './lib/geoip'
import { IpInfo } from './types/ipApis'
import { NodeInfos, ViewFileInitData } from './types/methods'
import { ViewContent } from './types/viewPeersInfo'
import nodePath = require('node:path')

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

export const getPeersInfo = async (ipfsApis: IIpfsApis, ipfsGateway: string): Promise<ViewContent[]> => {
  const peersInfo = await ipfsApis.getPeersInfo()

  return await Promise.all(
    peersInfo.map(async (peerInfo) => {
      const ip = peerInfo.Addr.split('/')[2]
      const ipInfo: IpInfo = await lookup(ipfsGateway, ip).catch(() => ({
        status: 'failed',
        country: 'Unknown',
        countryCode: 'Unknown',
        city: 'Unknown'
      }))
      const emoj = ipInfo.status === 'success' ? countryCodeEmoji(ipInfo.countryCode) : '🌏'
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
