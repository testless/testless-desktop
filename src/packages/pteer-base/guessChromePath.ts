import {
  darwin,
  linux,
  win32,
  wsl
} from 'chrome-launcher/dist/chrome-finder'
import { getPlatform } from 'chrome-launcher/dist/utils'

import Logger from '../../Logger'

type Platform = 'wsl' | 'aix' | 'android' | 'darwin' | 'freebsd' | 'linux' | 'openbsd' | 'sunos' | 'win32' | 'cygwin'

const supportedPlatforms: Partial<Record<Platform, () => string[]>> = {
  darwin,
  linux,
  win32,
  wsl
}

export const guessChromePath = (): string => {
  const platform: Platform = getPlatform()

  if (platform) {
    const getChromeForPlatform = supportedPlatforms[platform]

    if (getChromeForPlatform) {
      const paths = getChromeForPlatform()

      if (paths.length > 0) {
        Logger.info(
          `The following chrome/chromium versions have been found at following paths`,
          paths.map(
            (x: string, i: number) => `${i + 1}.\t ${x}`
          ).join('\n')
        )

        if (!paths[0]) {
          throw new Error(`No chromium paths have been found`)
        }
        return paths[0]
      } else {
        throw new Error(`No chrome installationn was found. Please install a chrome/chromium version`)
      }
    } else {
      throw new Error(`Platform ${platform} is not supported.`)
    }
  } else {
    throw new Error(`Platform is not known.`)
  }
}
