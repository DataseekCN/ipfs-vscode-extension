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
  let regex = /(北京)|(沧海)|(夕)|(兮)|(十年生死)|(茫茫)|(不思量)|(自难忘)/g

  while ((match = regex.exec(text)) && daemonStatus == DAEMONE_ON) {
    const startPos = editor.document.positionAt(match.index)
    const endPos = editor.document.positionAt(match.index + match[0].length)
    const decoration = {
      range: new vscode.Range(startPos, endPos),
      hoverMessage: ['which match' + match[0], 'test']
    }
    decorators.push(decoration)
  }
  editor.setDecorations(style, decorators)
}
