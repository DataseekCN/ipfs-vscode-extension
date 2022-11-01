import vscode from 'vscode'
import { DaemonLogger } from './daemonLogger'

export class ViewStdout implements vscode.WebviewViewProvider {
  public static readonly viewType = 'ipfs-panel-stdout'

  private extensionUri: vscode.Uri
  private daemonLogger: DaemonLogger

  constructor(context: vscode.ExtensionContext, daemonLogger: DaemonLogger) {
    const webview = vscode.window.registerWebviewViewProvider('ipfs-panel-stdout', this)
    context.subscriptions.push(webview)
    this.extensionUri = context.extensionUri
    this.daemonLogger = daemonLogger
  }

  public resolveWebviewView(webviewView: vscode.WebviewView) {
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this.extensionUri]
    }
    webviewView.webview.html = this.getHtmlForWebview()

    this.injectLogToWebview(webviewView)
  }

  private injectLogToWebview(webviewView: vscode.WebviewView) {
    const writeLog = (log: string) => webviewView.webview.postMessage(log)

    writeLog(this.daemonLogger.logs)
    this.daemonLogger.on('data', writeLog)

    webviewView.onDidChangeVisibility(() => {
      if (webviewView.visible) {
        writeLog(this.daemonLogger.logs)
      }
    })

    webviewView.onDidDispose(() => this.daemonLogger.removeListener('data', writeLog))
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
