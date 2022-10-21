import { IpInfo } from '../types/ipApis'
import { HttpClient, IHttpClient } from './client'

export class IpApis {
  private httpClient: IHttpClient

  constructor() {
    this.httpClient = new HttpClient('http://ip-api.com')
  }

  async getIpInfo(ip: string): Promise<IpInfo> {
    const queryPath = '/batch'
    try {
      return (await this.httpClient.post<IpInfo[]>({ queryPath, data: [ip] }))[0]
    } catch (e) {
      console.log(e)
      throw new Error('Failed to get ip info.')
    }
  }
}
