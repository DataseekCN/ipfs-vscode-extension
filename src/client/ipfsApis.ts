import FormData from 'form-data'
import { handleTimeString } from '../methods'
import { IHttpClientRequestParameters } from '../types/client'
import { HttpClient, IHttpClient } from './client'

export interface IIpfsApis {
  getFileRootCid(): Promise<string>
  getFileByCid(cid: string): Promise<IpfsFile[]>
  getPinnedFile(): Promise<string[]>
  getPeersInfo(): Promise<PeerInfo[]>
  getConfigs(): Promise<NodeInfo>
  getNodeId(): Promise<NodeId>
  setPinning(cid: string): Promise<void>
  unsetPinng(cid: string): Promise<void>
  upload(parameters: { formData: FormData; baseDir?: string; isDir?: boolean }): Promise<UploadResponse>
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
      return (await this.httpClient.post<PeersInfo>({ queryPath })).Peers.sort(
        (a, b) => handleTimeString(a.Latency) - handleTimeString(b.Latency)
      )
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

  async getFileByCid(cid: string): Promise<IpfsFile[]> {
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

  async upload(parameters: { formData: FormData; baseDir?: string; isDir?: boolean }): Promise<UploadResponse> {
    const { formData, baseDir, isDir } = parameters
    const uploadToNode: IHttpClientRequestParameters = {
      queryPath: '/add?stream-channels=true&pin=false&wrap-with-directory=false&progress=false',
      data: formData,
      options: {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    }

    const cpToDir: IHttpClientRequestParameters = {
      queryPath: '/files/cp'
    }
    if (isDir) {
      const dirUploadRes = (await this.httpClient.post<UploadResponse>(uploadToNode)) as unknown as string
      const regex = new RegExp(`(\{"Name":"${baseDir}".+\})`)
      console.log(baseDir)
      console.log(dirUploadRes)
      console.log(dirUploadRes.match(regex))
      const arr = dirUploadRes.match(regex)
      if (arr) {
        const target = arr[0]
        const obj = JSON.parse(target)
        console.log(obj)
        const queryString = `?arg=${encodeURI('/ipfs/' + obj.Hash)}&arg=${encodeURI('/' + obj.Name)}`
        cpToDir.queryPath = cpToDir.queryPath + queryString
        return await this.httpClient.post<UploadResponse>(cpToDir)
      } else {
        throw new Error('Failed to upload dir.')
      }
    } else {
      try {
        const { Hash, Name } = await this.httpClient.post<UploadResponse>(uploadToNode)
        const queryString = `?arg=${encodeURI('/ipfs/' + Hash)}&arg=${encodeURI('/' + Name)}`
        cpToDir.queryPath = cpToDir.queryPath + queryString
        return await this.httpClient.post<UploadResponse>(cpToDir)
      } catch (e) {
        console.log(e)
        throw new Error('Failed to upload file.')
      }
    }
  }
}
