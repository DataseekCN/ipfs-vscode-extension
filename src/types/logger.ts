export type LogType = 'daemon' | 'ipfs'

export type Subscriber = (content: string) => void
export type Unsubscriber = () => void

export interface Log {
  type: LogType
  content: string
}
