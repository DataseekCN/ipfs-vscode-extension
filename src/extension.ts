// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode'
import { ViewFiles } from './viewFiles'
import { ViewNodeInfo } from './viewNodeInfo'

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "ipfs-vscode-extension" is now active!')

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  let disposable = vscode.commands.registerCommand('ipfs-vscode-extension.helloWorld', () => {
    // The code you place here will be executed every time your command is executed
    // Display a message box to the user
    vscode.window.showInformationMessage('Hello World!!!!')
  })

  let disposable2 = vscode.commands.registerCommand('ipfs-vscode-extension.loadMore', () => {
    vscode.window.showInformationMessage('Will load more peers info')
  })

  let disposable3 = vscode.commands.registerCommand('ipfs-vscode-extension.uploadFile', () => {
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

  const nodeInfo = {
    'Node Status': 'Online',
    'Peer ID': '12D3KooWQpGDcLsJ5RQmyoqnF5iNrofemJNcUHbv2UWN2tkixtRo',
    API: '/ip4/127.0.0.1/tcp/5001',
    GateWay: 'http://127.0.0.1:8080',
    'Public Key': 'CAESIN7Yk1agiu0aO2RqZMgldEX6ED0453SqQgmKj7HFyvAS'
  }

  const files: File[] = [
    {
      fileName: 'abc.txt',
      cid: ''
    },
    {
      fileName: 'this a folder 1',
      cid: '',
      children: [
        {
          fileName: 'ddd.txt',
          cid: ''
        }
      ]
    },
    {
      fileName: 'this a folder 2',
      cid: '',
      children: [
        {
          fileName: 'eee.txt',
          cid: ''
        },
        {
          fileName: 'this a folder 3',
          cid: '',
          children: [
            {
              fileName: 'fff.txt',
              cid: ''
            }
          ]
        }
      ]
    }
  ]

  new ViewNodeInfo(context, nodeInfo)

  new ViewFiles(context, files)

  context.subscriptions.push(disposable)
  context.subscriptions.push(disposable2)
  context.subscriptions.push(disposable3)
}

// this method is called when your extension is deactivated
export function deactivate() {}
