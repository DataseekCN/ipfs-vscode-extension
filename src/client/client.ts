import axios, { AxiosRequestConfig } from 'axios'
import { IHttpClientRequestParameters } from '../types/client'

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
      const { queryPath, args, data, options } = parameters
      const queryArgs = args ? `?arg=${args}` : ''

      console.log('calling: ', `${queryPath}${queryArgs}`)
      console.log(data)
      axios
        .post(`${queryPath}${queryArgs}`, data, { ...this.options, ...options })
        .then((response: any) => {
          resolve(response.data as T)
        })
        .catch((response: any) => {
          reject(response)
        })
    })
  }
}
