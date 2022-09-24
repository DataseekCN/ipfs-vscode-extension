import * as vscode from 'vscode';
import { ViewLoader } from './view/ViewLoader';
import { CommonMessage } from './view/messages/messageTypes';
// import * as IPFS_CORE from 'ipfs-core';
import { Daemon } from "ipfs-daemon";
import * as os from "os";
// import * as IPFS_CLIENT from 'ipfs-http-client';
// import { URL } from 'url';

export async function activate(context: vscode.ExtensionContext) {
  console.log('恭喜，您的扩展“vscode-plugin-demo”已被激活！');
  let daemon
  daemon = createDaemon()
  await daemon.start()
  console.log('ipfs daemon start！');

  //   const {
  //       uri
  //   } = daemon._httpApi._apiServers[0].info

  //   const ipfsClient = IPFS_CLIENT.create(new URL(uri))
  //   const ipfsCore = await IPFS_CORE.create()

  //   const idFromCore = await daemon._ipfs.id()


  //   //list of known addresses of each peer connected without open streams
  //   const peerInfos = await ipfsCore.swarm.addrs()

  //   peerInfos.forEach(async info => {
  //     console.log("info id is", info.id)
  //     /*
  //     QmcZf59bWwK5XFi76CZX8cbJ4BhTzzA3gU1ZjYZcYW3dwt
  //     */

  //     info.addrs.forEach(addr => console.log("address is", addr.toString()))
  //     /*
  //     /ip4/147.75.94.115/udp/4001/quic
  //     /ip6/2604:1380:3000:1f00::1/udp/4001/quic
  //     /dnsaddr/bootstrap.libp2p.io
  //     /ip6/2604:1380:3000:1f00::1/tcp/4001
  //     /ip4/147.75.94.115/tcp/4001
  //     */

  //   //   await ipfsCore.swarm.connect(info.id)

  //   //   console.log("connect")

  //   //   const peerInfoss = await ipfsCore.swarm.peers({direction: true, streams: true, verbose: true, latency: true})

  //   //   console.log("peerInfoss is ", peerInfoss)

  //   //   await ipfsCore.swarm.disconnect(info.id)

  //     console.log("disconnect")
  //   })


  //   //peer id
  //   const peerId = (await ipfsClient.id()).id
  //   console.log(`peer Id is: ${peerId}`)

  //   //add file
  //   const file = await ipfsClient.add("hello ipfs demo")
  //   console.log(file)

  //   //daemon api endpoint
  //   console.log(`uri is : ${uri}`)

  //   //public key
  //   console.log(`publicKey is ${idFromCore.publicKey}`)


  // 注册命令
  context.subscriptions.push(vscode.commands.registerCommand('extension.sayHello', function () {
    vscode.window.showInformationMessage('Hello World!');
  }));

  context.subscriptions.push(
    vscode.commands.registerCommand('webview.open', () => {
      ViewLoader.showWebview(context);
    }),

    vscode.commands.registerCommand('extension.sendMessage', () => {
      vscode.window
        .showInputBox({
          prompt: 'Send message to Webview',
        })
        .then(result => {
          result &&
            ViewLoader.postMessageToWebview<CommonMessage>({
              type: 'COMMON',
              payload: result,
            });
        });
    })
  );
}

function createDaemon() {
  //location of creating key pair
  const newLocal = `${os.tmpdir()}/ipfs-test-123`
  console.log(newLocal)
  //config api, gateway port, 0 means random
  return new Daemon({
    init: {
      bits: 512
    },
    repo: newLocal,
    config: {
      Addresses: {
        Swarm: [],
        API: '/ip4/127.0.0.1/tcp/0',
        Gateway: '/ip4/127.0.0.1/tcp/0',
        RPC: '/ip4/127.0.0.1/tcp/0'
      }
    }
  })
}

export function deactivate() { }
