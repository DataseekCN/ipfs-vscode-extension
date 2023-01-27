import vscode from 'vscode'
import logger from './logger'
import { LogType, Unsubscriber } from './types/logger'

export class ViewLogPanel implements vscode.WebviewViewProvider {
  public static readonly viewType = 'ipfs-log-panel'

  private extensionUri: vscode.Uri

  constructor(context: vscode.ExtensionContext) {
    const webview = vscode.window.registerWebviewViewProvider(ViewLogPanel.viewType, this)
    context.subscriptions.push(webview)
    this.extensionUri = context.extensionUri
  }

  public resolveWebviewView(webviewView: vscode.WebviewView) {
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this.extensionUri]
    }
    webviewView.webview.html = this.getHtmlForWebview()
    this.subscribeAndLogToWebview(webviewView)
  }

  private subscribeAndLogToWebview(webviewView: vscode.WebviewView) {
    const subscribeLog = (type: LogType) =>
      logger.subscribe(type, (content) => webviewView.webview.postMessage({ type, content }))

    let unsubscribeDaemonLog: Unsubscriber
    let unsubscribeIpfsLog: Unsubscriber

    const subscribe = () => {
      unsubscribeDaemonLog = subscribeLog('daemon')
      unsubscribeIpfsLog = subscribeLog('ipfs')
    }

    const unsubscribe = () => {
      unsubscribeDaemonLog()
      unsubscribeIpfsLog()
    }

    subscribe()

    webviewView.onDidChangeVisibility(() => {
      if (webviewView.visible) {
        subscribe()
      } else {
        unsubscribe()
      }
    })

    webviewView.onDidDispose(unsubscribe)
  }

  private getHtmlForWebview() {
    return `
      <!DOCTYPE html>
      <html>
        <body>
          <script>${require('./ui/scripts/daemonLogPanel.ui')}</script>
        </body>
      </html>
    `
  }
}
