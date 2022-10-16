import { HttpClient, IHttpClient } from './client'

export interface IIpfsApis {
  getFileRootCid(): Promise<String>
  getFileByCid(cid: String): Promise<File[]>
}

export class IpfsApis implements IIpfsApis {
  private baseUrl: string
  private httpClient: IHttpClient

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
    this.httpClient = new HttpClient(this.baseUrl)
  }

  async getFileRootCid(): Promise<String> {
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
    const queryPath = 'ls'
    try {
      return (await this.httpClient.post<FileByCid>({ queryPath, args: cid })).Objects.Links
    } catch (e) {
      console.log(e)
      throw new Error('Failed to get file.')
    }
  }
}
