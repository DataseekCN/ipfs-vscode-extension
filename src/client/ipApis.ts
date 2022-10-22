import { IpInfo } from '../types/ipApis'
import { HttpClient, IHttpClient } from './client'

export class IpApis {
  private httpClient: IHttpClient

  constructor() {
    this.httpClient = new HttpClient('http://ip-api.com')
  }

  async getIpInfo(ips: string[]): Promise<IpInfo[]> {
    const queryPath = '/batch'
    try {
      return await this.httpClient.post<IpInfo[]>({ queryPath, data: ips })
    } catch (e) {
      console.log(e)
      throw new Error('Failed to get ip info.')
    }
  }
}
