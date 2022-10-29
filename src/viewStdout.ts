import { ChildProcess } from 'child_process'
import * as vscode from 'vscode'

export class ViewStdout implements vscode.WebviewViewProvider {
  public static readonly viewType = 'ipfs-panel-stdout'

  private _view?: vscode.WebviewView
  private _extensionUri: vscode.Uri
  private daemon?: ChildProcess

  constructor(context: vscode.ExtensionContext, daemon?: ChildProcess) {
    const webview = vscode.window.registerWebviewViewProvider('ipfs-panel-stdout', this)
    context.subscriptions.push(webview)
    this._extensionUri = context.extensionUri
    this.daemon = daemon
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

    webviewView.webview.onDidReceiveMessage(() => {})
  }

  private _getHtmlForWebview(webview: vscode.Webview) {
    const scriptPathOnDisk = vscode.Uri.joinPath(this._extensionUri, 'src', 'stdout.js')
    const scriptUri = webview.asWebviewUri(scriptPathOnDisk)
    let log: string = 'init'
    this.daemon?.stdout?.on('data', (chunk) => (log = chunk))

    return `<!DOCTYPE html>
    <html>
      <head>
        <script type="text/javascript" src="${scriptUri}"></script>
      </head>
      <body>
        <script type="text/javascript"> writeStdoutToHtml(); </script>
      </body>
    </html>`
  }
}
