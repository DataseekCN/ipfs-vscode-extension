import * as vscode from 'vscode'

export class ViewStdout implements vscode.WebviewViewProvider {
  public static readonly viewType = 'ipfs-panel-stdout'

  private _view?: vscode.WebviewView
  private _extensionUri: vscode.Uri
  constructor(context: vscode.ExtensionContext) {
    const webview = vscode.window.registerWebviewViewProvider('ipfs-panel-stdout', this)
    context.subscriptions.push(webview)
    this._extensionUri = context.extensionUri
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

    return `<!DOCTYPE html>
    <html>
    <head>
    <script type="text/javascript" src="${scriptUri}"></script>
    </head>
    <body>
    <div>这里是页面内容，最后放JavaScript代码</div>
    <script type="text/javascript"> abc() </script>
    </body>
    </html>`
  }
}
