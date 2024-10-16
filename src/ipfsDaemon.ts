import { execFile } from 'child_process'
import { promises as fs } from 'fs'
import got from 'got'
import { homedir } from 'os'
import path from 'path/posix'
import logger from './logger'

const CONFIG_PATH = path.join(homedir(), '.ipfs', 'config')

const getIpfsConfig = async () => {
  try {
    const config = JSON.parse(await fs.readFile(CONFIG_PATH, 'utf-8'))
    const [, , apiAddress, , apiPort] = config.Addresses.API.split('/')
    const [, , gatewayAddress, , gatewayPort] = config.Addresses.Gateway.split('/')

    return {
      api: `http://${apiAddress}:${apiPort}/api/v0`,
      gateway: `http://${gatewayAddress}:${gatewayPort}`
    }
  } catch (error) {
    console.error(error)

    return {
      api: 'http://127.0.0.1:5001/api/v0',
      gateway: 'http://127.0.0.1:8080'
    }
  }
}

const isDaemonAlreadyExists = async (api: string) => {
  try {
    await got.post(`${api}/id`)
    return true
  } catch {
    return false
  }
}

const waitDaemon = async (api: string) => {
  let retryLimit = 10
  while (retryLimit-- > 0) {
    try {
      await got.post(`${api}/id`)
      return
    } catch (error: any) {
      console.error(error.message)
      await new Promise((r) => setTimeout(r, 1000))
      continue
    }
  }
  throw new Error('Daemon not responding')
}

export const initializeDaemon = async (binPath: string) => {
  const { api, gateway } = await getIpfsConfig()

  if (await isDaemonAlreadyExists(api)) {
    console.log(`Daemon already exists on ${api}, using the existing one.`)
    logger.log('daemon', 'Logs will be available once you close off all IPFS applications and processes.')
    return { api, gateway }
  }

  console.log('Initializing daemon...')
  const exePath = path.join(binPath, 'kubo', 'ipfs')
  const daemon = execFile(exePath, ['daemon', '--init'])
  daemon.stdout?.on('data', (content) => logger.log('daemon', content))
  await waitDaemon(api)
  return { api, gateway }
}
