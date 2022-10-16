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
const download = require('./download/download')

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

  const nodeInfo = {
    'Node Status': 'Online',
    'Peer ID': '12D3KooWQpGDcLsJ5RQmyoqnF5iNrofemJNcUHbv2UWN2tkixtRo',
    API: '/ip4/127.0.0.1/tcp/5001',
    GateWay: 'http://127.0.0.1:8080',
    'Public Key': 'CAESIN7Yk1agiu0aO2RqZMgldEX6ED0453SqQgmKj7HFyvAS'
  }

  const ipfsApis = new IpfsApis('http://127.0.0.1:5001/api/v0')

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
    vscode.window.showOpenDialog(options).then((fileUri) => {
      if (fileUri && fileUri[0]) {
        vscode.window.showInformationMessage(fileUri[0].fsPath)
      }
    })
  })

  const shareLink = vscode.commands.registerCommand('ipfs-vscode-extension.shareLink', (args: MockFile) => {
    const shareLink = `https://ipfs.io/ipfs/${args.cid}?filename=${args.fileName}`
    vscode.env.clipboard.writeText(shareLink)
    vscode.window.showInformationMessage(`Copy link completed! Links is : ${shareLink}`)
  })

  const copyCid = vscode.commands.registerCommand('ipfs-vscode-extension.copyCid', (args: MockFile) => {
    const cid = args.cid
    vscode.env.clipboard.writeText(cid)
    vscode.window.showInformationMessage(`Copy CID completed! CID is : ${cid}`)
  })

  const openInWebView = vscode.commands.registerCommand('ipfs-vscode-extension.openInWebView', (args: MockFile) => {
    const fileLink = `${nodeInfo.GateWay}/ipfs/${args.cid}?filename=${args.fileName}`
    const panel = vscode.window.createWebviewPanel('Webview', args.fileName, vscode.ViewColumn.One, {
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

  const setPinning = vscode.commands.registerCommand('ipfs-vscode-extension.setPinning', async (args: MockFile) => {
    const cid = args.cid
    //set pinning and change icon
    vscode.window.showInformationMessage(`Set pinning successfully! CID is : ${cid}`)
  })

  const files: MockFile[] = [
    {
      fileName: 'ipfs.svg',
      cid: 'QmWiZT7v1RQue8tSSAkBDWM4WuXLudJH78MehqXnVmM8CT'
    },
    {
      fileName: 'cdnjs',
      cid: 'QmU93aJAqRCuTuzGKfpogxJqVTgkQ9awK8qy7ZF1Fy8Tbs',
      children: [
        {
          fileName: 'ddd.txt',
          cid: 'QmWiZT7v1RQue8tSSAkBDWM4WuXLudJH78MehqXnVmM8CT'
        }
      ]
    },
    {
      fileName: 'this a folder 2',
      cid: 'QmYccxN65uH3PecEaNTpEE8WmLLgnqrpDfwqqXEe8X6QeE',
      children: [
        {
          fileName: 'eee.txt',
          cid: 'QmWiZT7v1RQue8tSSAkBDWM4WuXLudJH78MehqXnVmM8CT'
        },
        {
          fileName: 'this a folder 3',
          cid: '',
          children: [
            {
              fileName: 'fff.txt',
              cid: 'QmWiZT7v1RQue8tSSAkBDWM4WuXLudJH78MehqXnVmM8CT'
            }
          ]
        }
      ]
    }
  ]

  new ViewNodeInfo(context, nodeInfo)

  new ViewFiles(context, files)

  context.subscriptions.push(helloWorld, loadMorePeersInfo, uploadFile, shareLink, copyCid, setPinning, openInWebView)
}

// this method is called when your extension is deactivated
export function deactivate() {}
