![IPFS Logo](https://user-images.githubusercontent.com/54736083/212450630-50bc21d2-f669-400a-acab-0266477f4d2b.png)

# IPFS VS Code
IPFS VS Code allows easy installation of IPFS node daemon in VS Code environment. It provides a one-click installation and integrated development experience including running of node daemon, getting peer information, uploading/pinning files, accessing IPFS Web UI, CID syntax highlighting. 
![Jan-14-2023 15-20-23](https://user-images.githubusercontent.com/109561889/212460973-9cf34427-9011-4595-b796-3774ce1ad0ef.gif)

### Features 
- Start & stop Kubo (go-ipfs) daemon
- Show node information & peers information in the sidebar
- Upload files & folders from explorer and the sidebar 
- List files & folders in IPFS node and allow pinning and unpinning of files
- Show IPFS Web UI in VS Code WebView
- View IPFS file content via VS Code WebView
- CID syntax highlight and tooltip information

# How to Use
Simply install via VS Code extension marketplace, and click on the IPFS logo. The extension will install the latest Kubo (ipfs-go) [binaries](https://dist.ipfs.tech/) for your OS to run the daemon in VS Code environment. The extension interacts with Kubo via local API endpoints.

If your OS already has a running instance of [IPFS CLI](https://docs.ipfs.tech/install/command-line/#install-official-binary-distributions) or [IPFS Desktop](https://docs.ipfs.tech/install/ipfs-desktop/) the extension will detect and communicate directly with the running instance instead of the VS Code one.

To access node information, see connected peer information, and view files & folders, go to side bar of the extension.
![image](https://user-images.githubusercontent.com/109561889/212460673-85f0dbc2-ab03-42e3-82ff-3826a9995396.png)

If you have a CID (v0 or v1) in the code editor, the IPFS VS Code will detect it and show information such s multibase, CID version, and multicodec. 
![image](https://user-images.githubusercontent.com/109561889/212460719-01d82ef4-94d3-4923-a264-0e826284bae1.png)

With the extension enabled, Anywhere in the file explorer, you can upload any folder and file easily via right-click. 
![uploadtoipfs](https://user-images.githubusercontent.com/109561889/212460990-43d16eb6-d6d0-44fc-a879-53f3114b8ece.gif)

To view your file, right-click on the file and select "Open in WebView".
![webview](https://user-images.githubusercontent.com/109561889/212460999-2d5b4f7f-d6f4-4b55-9e95-ef7ec0987d09.gif)

Web UI will give you full control over your IPFS daemon. 
![image](https://user-images.githubusercontent.com/109561889/212461064-aeb15f12-ed38-45af-9717-70fabb7a6cc8.png)

To shut down or restart the daemon, use buttons available in the sidebar or the status bar at the bottom right of VS Code. 
![image](https://user-images.githubusercontent.com/109561889/212461071-193ecd7c-4826-4271-810b-d104c47dff05.png)
![image](https://user-images.githubusercontent.com/109561889/212461076-312008d0-7239-4aea-89d0-665ac1f3f51c.png)

Closing VS Code, disabling the extension, or uninstalling the extension will stop the daemon process. Only uninstalling will remove the binary from VS Code global storage completely.

# What is IPFS?
InterPlanetary File System, is a peer-to-peer hypermedia protocol and a distributed system for storing and accessing files, websites, applications, and data. It uses content addressing instead of a location-based addressing scheme to store files. It uses p2p communication protocols to make 1000s of computers work as one without a centralized server. Making the network offline first and resilient to outages. 

![image](https://user-images.githubusercontent.com/54736083/212459123-5ef53310-3fe3-4c3c-9bc0-fdaaf274e271.png)

ChatGPT explains it like this:
![image](https://user-images.githubusercontent.com/54736083/212459248-a0d62d4f-c1f2-47fb-b970-8666bb0b8f52.png)

IPFS official site is [https://ipfs.tech/](https://ipfs.tech/). 

See this [quick 2 mins video explanation](https://www.youtube.com/watch?v=k1EQC7tdh70) of IPFS:

![image](https://user-images.githubusercontent.com/54736083/212457452-c6308f2b-cdf3-4811-8d71-0e9f4d639d7e.png)

IPFS founder[ Juan Benet's speech](https://www.youtube.com/watch?v=HUVmypx9HGI) at Standford University: 

![image](https://user-images.githubusercontent.com/54736083/212458987-f94c52b9-4289-4ebd-9245-6eb9ade0aa68.png)

For full documentation of IPFS visit [docs.ipfs.tech](https://docs.ipfs.tech/). 

To see awesome projects built on IPFS visit [awesome.ipfs.tech](https://awesome.ipfs.tech/).

IPFS is proudly made by [Protocol Labs](https://protocol.ai/work/). Check out their work such as [IPLD](https://ipld.io/), [Libp2p](https://libp2p.io/), [Drand](https://drand.love/) [here](https://protocol.ai/work/).

# Contributing and development 
You can checkout code on [github.com](https://github.com/DataseekCN/ipfs-vscode-extension). 

## Issues and Feedback
Please raise all of your issues and feedback [here](https://github.com/DataseekCN/ipfs-vscode-extension/issues)

## Debugging
To run VS Code local debugger, pull down the repo, open it with VS Code then press `F5` to start IPFS node in debugger mode.

See VS Code Extension development docs [here](https://code.visualstudio.com/api/extension-guides/overview). 

## Packaging and Testing
Run `yarn` or `npm install`, then `yarn package` or `npm run-script package` to produce the `.vsix` file VS Code can install.

# Frequently Asked Questions
> Q: Will this have conflict with other IPFS instances I installed? 
A: The extension will detect if an IPFS is already running on port 5001 then use the existing process first. 

> Q: If I close VS Code, will the daemon stop? 
A: Only if you completed shutdown VS Code will the process be killed. Disabling or uninstalling will also kill the process. Uninstalling will also remove the binary file installed. 

> Q: Where are the IPFS software installed? 
A: IPFS node binary is stored in VS Code Global Storage directory  associated with the extension. This will not be interfering with your normal IPFS installation.