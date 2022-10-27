import { ChildProcess } from 'child_process'

export type ViewFileInitData = {
  files: File[]
  pinnedCids: string[]
}

export type NodeInfos = {
  'Node Status': string
  'Peer ID': string
  API: string
  GateWay: string
  'Public Key': string
}

export type Daemon = {
  daemon: ChildProcess
  apiPath: string
}
