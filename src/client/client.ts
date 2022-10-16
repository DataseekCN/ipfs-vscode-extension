import { AxiosRequestConfig } from 'axios'
const axios = require('axios')

export interface IHttpClient {
  post<T>(parameters: IHttpClientRequestParameters): Promise<T>
}

export class HttpClient implements IHttpClient {
  private baseUrl: string
  private options: AxiosRequestConfig

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
    this.options = { baseURL: baseUrl }
  }

  post<T>(parameters: IHttpClientRequestParameters): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const { queryPath, args } = parameters
      const queryArgs = args ? `?arg=${args}` : ''

      axios
        .post(`${queryPath}${queryArgs}`, null, this.options)
        .then((response: any) => {
          resolve(response.data as T)
        })
        .catch((response: any) => {
          reject(response)
        })
    })
  }
}
