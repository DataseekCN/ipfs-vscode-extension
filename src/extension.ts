// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode'
import { ViewFiles } from './viewFiles'
import { ViewNodeInfo } from './viewNodeInfo'
const download = require('./download/download')

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "ipfs-vscode-extension" is now active!')

  download().catch((err: Error) => {
    console.error(err)
    process.exit(1)
  })

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

  const shareLink = vscode.commands.registerCommand('ipfs-vscode-extension.shareLink', (args: File) => {
    const shareLink = `https://ipfs.io/ipfs/${args.cid}?filename=${args.fileName}`
    vscode.env.clipboard.writeText(shareLink)
    vscode.window.showInformationMessage(`Copy link completed! Links is : ${shareLink}`)
  })

  const copyCid = vscode.commands.registerCommand('ipfs-vscode-extension.copyCid', (args: File) => {
    const cid = args.cid
    vscode.env.clipboard.writeText(cid)
    vscode.window.showInformationMessage(`Copy CID completed! CID is : ${cid}`)
  })

  const nodeInfo = {
    'Node Status': 'Online',
    'Peer ID': '12D3KooWQpGDcLsJ5RQmyoqnF5iNrofemJNcUHbv2UWN2tkixtRo',
    API: '/ip4/127.0.0.1/tcp/5001',
    GateWay: 'http://127.0.0.1:8080',
    'Public Key': 'CAESIN7Yk1agiu0aO2RqZMgldEX6ED0453SqQgmKj7HFyvAS'
  }

  const files: File[] = [
    {
      fileName: 'ipfs.svg',
      cid: 'QmWiZT7v1RQue8tSSAkBDWM4WuXLudJH78MehqXnVmM8CT'
    },
    {
      fileName: 'this a folder 1',
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

  context.subscriptions.push(helloWorld, loadMorePeersInfo, uploadFile, shareLink, copyCid)
}

// this method is called when your extension is deactivated
export function deactivate() {}
