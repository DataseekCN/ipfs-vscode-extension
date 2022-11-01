import vscode from 'vscode'
import { DaemonLogger } from './daemonLogger'

export class ViewStdout implements vscode.WebviewViewProvider {
  public static readonly viewType = 'ipfs-panel-stdout'

  private _view?: vscode.WebviewView
  private _extensionUri: vscode.Uri
  private _daemonLogger?: DaemonLogger

  constructor(context: vscode.ExtensionContext, daemonLogger?: DaemonLogger) {
    const webview = vscode.window.registerWebviewViewProvider('ipfs-panel-stdout', this)
    context.subscriptions.push(webview)
    this._extensionUri = context.extensionUri
    this._daemonLogger = daemonLogger
  }

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    this._view = webviewView

    webviewView.webview.options = {
      // Allow scripts in the webview
      enableScripts: true,
      localResourceRoots: [this._extensionUri]
    }
    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview)

    this._injectLogToWebview(webviewView)
  }

  private _injectLogToWebview(webviewView: vscode.WebviewView) {
    const writeLog = (log: string) => webviewView.webview.postMessage(log)

    writeLog(this._daemonLogger?.logs ?? '')
    this._daemonLogger?.on('data', writeLog)

    webviewView.onDidChangeVisibility(() => {
      if (webviewView.visible) {
        writeLog(this._daemonLogger?.logs ?? '')
      }
    })

    webviewView.onDidDispose(() => this._daemonLogger?.removeListener('data', writeLog))
  }

  private _getHtmlForWebview(webview: vscode.Webview) {
    const scriptPathOnDisk = vscode.Uri.joinPath(this._extensionUri, 'src', 'ui', 'scripts', 'daemonLogPanel.js')
    const scriptUri = webview.asWebviewUri(scriptPathOnDisk)

    return `
      <!DOCTYPE html>
      <html>
        <body>
          <script type="text/javascript" src="${scriptUri}"></script>
        </body>
      </html>
    `
  }
}
