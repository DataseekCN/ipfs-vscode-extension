import { HttpClient, IHttpClient } from './client'
import { IHttpClientRequestParameters } from '../types/client'
const fs = require('fs')

export interface IIpfsApis {
  getFileRootCid(): Promise<string>
  getFileByCid(cid: string): Promise<File[]>
  getPinnedFile(): Promise<string[]>
  getPeersInfo(): Promise<PeerInfo[]>
  getConfigs(): Promise<NodeInfo>
  getNodeId(): Promise<NodeId>
  setPinning(cid: string): Promise<void>
  unsetPinng(cid: string): Promise<void>
  upload(path: string): Promise<UploadResponse>
}

export class IpfsApis implements IIpfsApis {
  private baseUrl: string
  private httpClient: IHttpClient

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
    this.httpClient = new HttpClient(this.baseUrl)
  }

  async setPinning(cid: string): Promise<void> {
    const queryPath = `/pin/add?recursive=true&stream=true&arg=${cid}`
    try {
      await this.httpClient.post<void>({ queryPath })
    } catch (e) {
      console.log(e)
      throw new Error('Failed to set pinng.')
    }
  }

  async unsetPinng(cid: string): Promise<void> {
    const queryPath = `/pin/rm?recursive=true&arg=${cid}`
    try {
      await this.httpClient.post<void>({ queryPath })
    } catch (e) {
      console.log(e)
      throw new Error('Failed to unset pinng.')
    }
  }

  async getPeersInfo(): Promise<PeerInfo[]> {
    const queryPath = '/swarm/peers?verbose=true&timeout=10000ms'
    try {
      return await (
        await this.httpClient.post<PeersInfo>({ queryPath })
      ).Peers
    } catch (e) {
      console.log(e)
      throw new Error('Failed to get peers info.')
    }
  }

  async getFileRootCid(): Promise<string> {
    const queryPath = '/files/stat'
    const args = '/'
    try {
      return (await this.httpClient.post<Stat>({ queryPath, args })).Hash
    } catch (e) {
      console.log(e)
      throw new Error('Failed to get file root cid.')
    }
  }

  async getFileByCid(cid: string): Promise<File[]> {
    const queryPath = '/ls'
    try {
      return (await this.httpClient.post<FileByCid>({ queryPath, args: cid })).Objects[0].Links
    } catch (e) {
      console.log(e)
      throw new Error('Failed to get file info.')
    }
  }

  async getPinnedFile(): Promise<string[]> {
    const queryPath = '/pin/ls?type=recursive'
    try {
      return Object.keys((await this.httpClient.post<PinnedFiles>({ queryPath })).Keys)
    } catch (e) {
      console.log(e)
      throw new Error('Failed to get file info.')
    }
  }

  async getConfigs(): Promise<NodeInfo> {
    const queryPath = '/config/show'
    try {
      return await this.httpClient.post<NodeInfo>({ queryPath })
    } catch (e) {
      console.log(e)
      throw new Error('Failed to get config info.')
    }
  }

  async getNodeId(): Promise<NodeId> {
    const queryPath = '/id'
    try {
      return await this.httpClient.post<NodeId>({ queryPath })
    } catch (e) {
      console.log(e)
      throw new Error('Failed to get nodeId info.')
    }
  }

  async upload(path: string): Promise<UploadResponse> {
    const parameters: IHttpClientRequestParameters = {
      queryPath: '/id',
      data: '',
      options: {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    }
    try {
      return await this.httpClient.post<UploadResponse>(parameters)
    } catch (e) {
      console.log(e)
      throw new Error('Failed to get nodeId info.')
    }
  }
}
