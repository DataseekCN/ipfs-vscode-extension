import { CID } from 'multiformats/cid'
import * as vscode from 'vscode'
import { DAEMONE_ON, DAEMON_STATUS } from './constants'

const style = vscode.window.createTextEditorDecorationType({ color: '#92a8d1', textDecoration: 'underline' })

export const decorate = (context: vscode.ExtensionContext) => {
  let editor = vscode.window.activeTextEditor
  const daemonStatus = context.globalState.get(DAEMON_STATUS)
  if (!editor) {
    return
  }

  let match
  let decorators: vscode.DecorationOptions[] = []
  let text = editor.document.getText()
  let cidRegExp =
    /(Qm[1-9A-HJ-NP-Za-km-z]{44})|(b[A-Za-z2-7]{58})|(B[A-Z2-7]{58})|(z[1-9A-HJ-NP-Za-km-z]{48})|(F[0-9A-F]{50})/g

  while ((match = cidRegExp.exec(text)) && daemonStatus == DAEMONE_ON) {
    const startPos = editor.document.positionAt(match.index)
    const endPos = editor.document.positionAt(match.index + match[0].length)
    let cid: CID
    try {
      cid = CID.parse(match[0])
    } catch (error: any) {
      console.error(`Parse CID(${match[0]}) failed: ${error.message}`)
      continue
    }
    decorators.push({
      range: new vscode.Range(startPos, endPos),
      hoverMessage: buildCidHoverMessage(cid)
    })
  }
  editor.setDecorations(style, decorators)
}

const buildCidHoverMessage = (cid: CID): vscode.MarkdownString =>
  new vscode.MarkdownString(
    `**IPFS CID**

---

Version: \`${cid.version}\`

Code: \`${toHexString(cid.code)}\`

Multihash:
  - Code: \`${toHexString(cid.multihash.code)}\`
  - Digest (hex): \`${Buffer.from(cid.multihash.digest).toString('hex').toUpperCase()}\``
  )

const toHexString = (n: number): string => `0x${n.toString(16).toUpperCase()}`
