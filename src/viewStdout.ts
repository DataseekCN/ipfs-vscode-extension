import vscode from 'vscode'
import { DaemonLogger } from './daemonLogger'

export class ViewStdout implements vscode.WebviewViewProvider {
  public static readonly viewType = 'ipfs-panel-stdout'

  private extensionUri: vscode.Uri
  private daemonLogger: DaemonLogger
  private webviewView: vscode.WebviewView | null

  constructor(context: vscode.ExtensionContext, daemonLogger: DaemonLogger) {
    const webview = vscode.window.registerWebviewViewProvider('ipfs-panel-stdout', this)
    context.subscriptions.push(webview)
    this.extensionUri = context.extensionUri
    this.daemonLogger = daemonLogger
    this.webviewView = null
  }

  public resolveWebviewView(webviewView: vscode.WebviewView) {
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this.extensionUri]
    }
    webviewView.webview.html = this.getHtmlForWebview()
    this.webviewView = webviewView
    this.injectLogToWebview(webviewView)
  }

  private injectLogToWebview(webviewView: vscode.WebviewView) {
    const writeDaemonLog = (log: string) => webviewView.webview.postMessage({ type: 'daemon', log })

    writeDaemonLog(this.daemonLogger.logs)
    this.daemonLogger.on('data', writeDaemonLog)

    webviewView.onDidChangeVisibility(() => {
      if (webviewView.visible) {
        writeDaemonLog(this.daemonLogger.logs)
      }
    })

    webviewView.onDidDispose(() => this.daemonLogger.removeListener('data', writeDaemonLog))
  }

  public injectLogToCustomerLog(log: string) {
    if (!this.webviewView) {
      return
    }
    const writeCustomerLog = (log: string) => {
      if (!this.webviewView) {
        return
      }
      return this.webviewView.webview.postMessage({ type: 'ipfs', log })
    }

    writeCustomerLog(`${log}\n`)
    this.daemonLogger.on('data', writeCustomerLog)

    this.webviewView.onDidChangeVisibility(() => {
      if (!this.webviewView) {
        return
      }
      if (this.webviewView.visible) {
        writeCustomerLog(this.daemonLogger.logs)
      }
    })

    this.webviewView.onDidDispose(() => this.daemonLogger.removeListener('data', writeCustomerLog))
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
