import { execFile } from 'child_process'
import { promises as fs } from 'fs'
import got from 'got'
import { homedir } from 'os'
import * as path from 'path/posix'

const CONFIG_PATH = path.join(homedir(), '.ipfs', 'config')

const getIpfsConfig = async () => {
  try {
    const config = JSON.parse(await fs.readFile(CONFIG_PATH, 'utf-8'))
    const [, , address, , port] = config.Addresses.API.split('/')

    return {
      api: `http://${address}:${port}/api/v0`
    }
  } catch (error) {
    console.error(error)

    return {
      api: 'http://127.0.0.1:5001/api/v0'
    }
  }
}

const waitDaemon = async (api: string) => {
  let retryLimit = 10
  while (retryLimit-- > 0) {
    try {
      const { statusCode, statusMessage } = await got.post(`${api}/id`)
      if (statusCode === 200) {
        return
      }
      throw new Error(statusMessage)
    } catch (error: any) {
      console.error(error.message)
      await new Promise((r) => setTimeout(r, 1000))
      continue
    }
  }
  throw new Error('Daemon not responding')
}

export const initializeDaemon = async (binPath: string) => {
  const exePath = path.join(binPath, 'kubo', 'ipfs')
  console.log('Initializing daemon...')
  const { api } = await getIpfsConfig()
  const daemon = execFile(exePath, ['daemon', '--init'])
  await waitDaemon(api)
  return { daemon, api }
}
