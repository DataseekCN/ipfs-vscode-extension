import vscode from 'vscode'
import { DAEMON_STATUS, DAEMONE_OFF, DAEMONE_ON } from './constants'

let statusBar: vscode.StatusBarItem
let runStatus: boolean

export const createStatusBar = (context: vscode.ExtensionContext) => {
  statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100)
  vscode.commands.registerCommand('toggleDaemonStatus', async () => {
    const status = context.globalState.get(DAEMON_STATUS)
    // vscode.window.showInformationMessage(status === DAEMONE_ON ? 'on' : 'off')
    if (runStatus) return
    runStatus = true
    if (status === DAEMONE_OFF) {
      await vscode.commands.executeCommand('ipfs-vscode-extension.startDaemon')
    } else {
      await vscode.commands.executeCommand('ipfs-vscode-extension.stopDaemon')
    }
    runStatus = false
  })
  updateStatusBarText(DAEMONE_ON)
  statusBar.command = 'toggleDaemonStatus'
  context.subscriptions.push(statusBar)
  return statusBar
}

export const updateStatusBarText = (status: string) => {
  if (!statusBar) return
  if (status === DAEMONE_OFF) {
    statusBar.text = `$(debug-pause)IPFS node off`
  } else {
    statusBar.text = `$(debug-start)IPFS node on`
  }
  statusBar.show()
}
