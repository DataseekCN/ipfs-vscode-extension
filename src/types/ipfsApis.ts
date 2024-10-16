type Stat = {
  Blocks: number
  CumulativeSize: number
  Hash: string
  Size: number
  Type: string
}

type FileByCid = {
  Objects: {
    Hash: string
    Links: IpfsFile[]
  }[]
}

type IpfsFile = {
  Hash: string
  Name: string
  Size: number
  Target: string
  Type: number
}

type PinnedFiles = {
  Keys: object
}

type PeerInfo = {
  Addr: string
  Latency: string
  Peer: string
}

type PeersInfo = {
  Peers: PeerInfo[]
}

type NodeInfo = {
  Addresses: {
    Gateway: string
    API: string
  }
  Identity: {
    PeerID: string
  }
}

type NodeId = {
  PublicKey: string
}

type UploadResponse = {
  Hash: string
  Name: string
  Size: string
}
