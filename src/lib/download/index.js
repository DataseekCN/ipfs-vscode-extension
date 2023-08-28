import { default as got } from 'got'

const unzip = require('unzip-stream')
const tarFS = require('tar-fs')

const pkgConf = require('pkg-conf')
const goenv = require('./go-platform')
const path = require('path')
const fs = require('fs')
const gunzip = require('gunzip-maybe')

export function osInfo(version, platform, arch, installPath) {
  console.log('into os info')
  const conf = pkgConf.sync('go-ipfs', {
    cwd: process.env.INIT_CWD || process.cwd(),
    defaults: {
      // version: 'v' + pkg.version.replace(/-[0-9]+/, ''),
      version: 'v0.16.0',
      distUrl: 'https://dist.ipfs.tech'
    }
  })

  return {
    version: process.env.TARGET_VERSION || version || conf.version,
    platform: process.env.TARGET_OS || platform || goenv.GOOS,
    arch: process.env.TARGET_ARCH || arch || goenv.GOARCH,
    distUrl: process.env.GO_IPFS_DIST_URL || conf.distUrl,
    installPath: installPath ? path.resolve(installPath) : process.cwd()
  }
}

export async function getDownloadURL() {
  const { version, platform, arch, distUrl } = osInfo()

  await ensureVersion(version, distUrl)
  // https://dist.ipfs.tech/kubo/v0.16.0/dist.json
  const data = await got(`${distUrl}/kubo/${version}/dist.json`).json()

  if (!data.platforms[platform]) {
    throw new Error(`No binary available for platform '${platform}'`)
  }

  if (!data.platforms[platform].archs[arch]) {
    throw new Error(`No binary available for arch '${arch}'`)
  }

  const link = data.platforms[platform].archs[arch].link
  return `${distUrl}/kubo/${version}${link}`
}

export async function ensureVersion(version, distUrl) {
  const versions = (await got(`${distUrl}/go-ipfs/versions`).text()).trim().split('\n')

  if (versions.indexOf(version) === -1) {
    throw new Error(`Version '${version}' not available`)
  }
}

export function unpack(filePath, binPath) {
  return new Promise((resolve, reject) => {
    if (filePath.endsWith('.zip')) {
      return fs
        .createReadStream(filePath)
        .pipe(unzip.Extract({ path: binPath }).on('close', resolve).on('error', reject))
    }

    return fs
      .createReadStream(filePath)
      .pipe(gunzip())
      .pipe(tarFS.extract(binPath).on('finish', resolve).on('error', reject))
  })
}
