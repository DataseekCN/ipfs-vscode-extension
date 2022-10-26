// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode'
import { ViewFiles } from './viewFiles'
import { ViewNodeInfo } from './viewNodeInfo'
import { getDownloadURL, unpack } from './download/newDownload'
import got from 'got'
import * as nodeFs from 'fs'
import * as nodePath from 'path'
import { execFile } from 'child_process'
import { IpfsApis } from './client/ipfsApis'
import { IpApis } from './client/ipApis'
import { ViewPeersInfo } from './viewPeersInfo'
import { ViewContent } from './types/viewPeersInfo'
import countryCodeEmoji from 'country-code-emoji'
const ipdetails = require('node-ip-details')

// import { create, globSource } from 'ipfs-http-client'
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "ipfs-vscode-extension" is now active!')

  const fs = vscode.workspace.fs
  const Uri = vscode.Uri

  const globalStorageUri = context.globalStorageUri

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

  // initialize ipfs daemon
  const exePath = nodePath.join(binPath, 'kubo', 'ipfs')
  console.log('Initializing daemon...')
  const daemon = execFile(exePath, ['daemon', '--init'])
  const daemonOutput = vscode.window.createOutputChannel('IPFS Daemon')
  daemon.stdout?.on('data', (chunk) => daemonOutput.append(chunk))

  const ipfsApis = new IpfsApis('http://127.0.0.1:5001/api/v0')
  const ipApis = new IpApis()

  const nodeConfigs = await ipfsApis.getConfigs()

  const nodeId = await ipfsApis.getNodeId()

  const nodeInfo = {
    'Node Status': 'Online',
    'Peer ID': nodeConfigs.Identity.PeerID,
    API: nodeConfigs.Addresses.API,
    GateWay: nodeConfigs.Addresses.Gateway,
    'Public Key': nodeId.PublicKey
  }

  console.log(nodeInfo)

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  const helloWorld = vscode.commands.registerCommand('ipfs-vscode-extension.helloWorld', () => {
    // The code you place here will be executed every time your command is executed
    // Display a message box to the user
    vscode.window.showInformationMessage('Hello World!!!!')
  })

  const loadMorePeersInfo = vscode.commands.registerCommand('ipfs-vscode-extension.loadMore', () => {
    vscode.window.showInformationMessage('Will load more peers info')
  })

  const uploadFile = vscode.commands.registerCommand('ipfs-vscode-extension.uploadFile', () => {
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

  const shareLink = vscode.commands.registerCommand('ipfs-vscode-extension.shareLink', (args: File) => {
    const shareLink = `https://ipfs.io/ipfs/${args.Hash}?filename=${args.Name}`
    vscode.env.clipboard.writeText(shareLink)
    vscode.window.showInformationMessage(`Copy link completed! Links is : ${shareLink}`)
  })

  const copyCid = vscode.commands.registerCommand('ipfs-vscode-extension.copyCid', (args: File) => {
    const cid = args.Hash
    vscode.env.clipboard.writeText(cid)
    vscode.window.showInformationMessage(`Copy CID completed! CID is : ${cid}`)
  })

  const openInWebView = vscode.commands.registerCommand('ipfs-vscode-extension.openInWebView', (args: File) => {
    const fileLink = `${nodeInfo.GateWay}/ipfs/${args.Hash}?filename=${args.Name}`
    const panel = vscode.window.createWebviewPanel('Webview', args.Name, vscode.ViewColumn.One, {
      enableScripts: true,
      retainContextWhenHidden: true
    })
    panel.webview.html = getWebviewContent(fileLink)
  })

  const getWebviewContent = (link: String) => {
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

  const setPinning = vscode.commands.registerCommand('ipfs-vscode-extension.setPinning', async (args: File) => {
    const cid = args.Hash
    //set pinning and change icon
    vscode.window.showInformationMessage(`Set pinning successfully! CID is : ${cid}`)
  })

  const unsetPinning = vscode.commands.registerCommand('ipfs-vscode-extension.unsetPinning', async (args: File) => {
    const cid = args.Hash
    //set pinning and change icon
    vscode.window.showInformationMessage(`Unset pinning successfully! CID is : ${cid}`)
  })

  new ViewNodeInfo(context, nodeInfo)

  const rootCid = await ipfsApis.getFileRootCid()
  const files: File[] = await ipfsApis.getFileByCid(rootCid)
  const pinnedCids = await ipfsApis.getPinnedFile()
  vscode.commands.executeCommand('setContext', 'pinnedCids', pinnedCids)
  //关闭插件时候记得set位false
  vscode.commands.executeCommand('setContext', 'showIpfsPanel', true)
  new ViewFiles(context, files, pinnedCids, ipfsApis)

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

  new ViewPeersInfo(context, viewContents, ipfsApis)

  context.subscriptions.push(
    helloWorld,
    loadMorePeersInfo,
    uploadFile,
    shareLink,
    copyCid,
    setPinning,
    unsetPinning,
    openInWebView
  )
}

// this method is called when your extension is deactivated
export function deactivate() {}
