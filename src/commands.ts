import * as vscode from 'vscode'
import * as nodeFs from 'fs'
import * as nodePath from 'path'
import { getWebviewContent } from './methods'
import { ViewFiles } from './viewFiles'
import { IIpfsApis, IpfsApis } from './client/ipfsApis'
import * as FormData from 'form-data'
import { AppendOptions } from 'form-data'
import { glob } from 'glob'

export const helloWorld = vscode.commands.registerCommand('ipfs-vscode-extension.helloWorld', () => {
  vscode.window.showInformationMessage('Hello World!!!!')
})

export const uploadFile = (viewFiles: ViewFiles, ipfsApis: IpfsApis) => {
  return vscode.commands.registerCommand('ipfs-vscode-extension.uploadFile', () => {
    // more select options see here
    const options: vscode.OpenDialogOptions = {
      canSelectFolders: true,
      canSelectFiles: true
    }
    vscode.window.showOpenDialog(options).then(async (fileUri) => {
      if (fileUri && fileUri[0]) {
        const stat = nodeFs.statSync(fileUri[0].fsPath)
        if (stat.isDirectory()) {
          const formData = new FormData()
          const filenames = glob.sync('**/**', { cwd: fileUri[0].fsPath })
          const dirName = nodePath.basename(fileUri[0].fsPath)
          console.log(dirName)
          if (filenames.length > 0) {
            for (const filename of filenames) {
              const filePath = `${fileUri[0].fsPath}/${filename}`
              const filenameIPFS = toQueryString(`${dirName}/${filename}`)
              if (nodeFs.statSync(filePath).isFile()) {
                const options: AppendOptions = {
                  filename: filenameIPFS
                }
                console.log(filenameIPFS)
                formData.append(filenameIPFS, nodeFs.readFileSync(filePath), options)
              }
            }
            await ipfsApis.upload({ formData, baseDir: dirName, isDir: true })
            console.log(`${dirName}文件夹上传成功`)
          }
        } else if (stat.isFile()) {
          const formData = new FormData()
          const filename = nodePath.basename(fileUri[0].fsPath)
          const options: AppendOptions = {
            filename
          }
          formData.append(filename, nodeFs.readFileSync(fileUri[0].fsPath), options)
          console.log(filename)
          await ipfsApis.upload({ formData: formData })
          console.log(`${filename}文件上传成功`)
        } else {
          throw new Error('something wrong with the file system')
        }
        await viewFiles.refresh()
        vscode.window.showInformationMessage(fileUri[0].fsPath)
      }
    })
  })
}

function toQueryString(str: string) {
  return str.replaceAll('/', '%2F')
}

export const shareLink = vscode.commands.registerCommand('ipfs-vscode-extension.shareLink', (args: File) => {
  const shareLink = `https://ipfs.io/ipfs/${args.Hash}?filename=${args.Name}`
  vscode.env.clipboard.writeText(shareLink)
  vscode.window.showInformationMessage(`Copy link completed! Links is : ${shareLink}`)
})

export const copyCid = vscode.commands.registerCommand('ipfs-vscode-extension.copyCid', (args: File) => {
  const cid = args.Hash
  vscode.env.clipboard.writeText(cid)
  vscode.window.showInformationMessage(`Copy CID completed! CID is : ${cid}`)
})

export const openInWebView = (gateWay: string) =>
  vscode.commands.registerCommand('ipfs-vscode-extension.openInWebView', (args: File) => {
    const fileLink = `${gateWay}/ipfs/${args.Hash}?filename=${args.Name}`
    const panel = vscode.window.createWebviewPanel('Webview', args.Name, vscode.ViewColumn.One, {
      enableScripts: true,
      retainContextWhenHidden: true
    })
    panel.webview.html = getWebviewContent(fileLink)
  })

export const setPinning = (viewFiles: ViewFiles, ipfsApis: IIpfsApis) =>
  vscode.commands.registerCommand('ipfs-vscode-extension.setPinning', async (args: File) => {
    const cid = args.Hash
    await ipfsApis.setPinning(cid)
    await viewFiles.refresh()
    vscode.window.showInformationMessage(`Set pinning successfully! CID is : ${cid}`)
  })

export const unsetPinning = (viewFiles: ViewFiles, ipfsApis: IIpfsApis) =>
  vscode.commands.registerCommand('ipfs-vscode-extension.unsetPinning', async (args: File) => {
    const cid = args.Hash
    await ipfsApis.unsetPinng(cid)
    await viewFiles.refresh()
    vscode.window.showInformationMessage(`Unset pinning successfully! CID is : ${cid}`)
  })

export const loadMorePeersInfo = vscode.commands.registerCommand('ipfs-vscode-extension.loadMore', async () => {
  vscode.window.showInformationMessage('Will load more peers info')
})
