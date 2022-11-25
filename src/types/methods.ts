export type ViewFileInitData = {
  files: IpfsFile[]
  pinnedCids: string[]
}

export type NodeInfos = {
  'Node Status': string
  'Peer ID': string
  API: string
  GateWay: string
  'Public Key': string
  'Peer Number'?: number
}
