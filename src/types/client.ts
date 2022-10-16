import { AxiosRequestConfig } from 'axios'

export type IHttpClientRequestParameters = {
  queryPath: string
  args?: string
  options?: AxiosRequestConfig
  data?: any
}
