import * as winston from 'winston'

import {
  ILogger
} from './packages/testcases'

import Logger from './Logger'
import { getCurrentRevision } from './main/createPuppeteerInstance'
import {
  getLatestRevisions,
  getLocalRevision
} from './main/downloadChromeRevision'

import * as ElectronStore from 'electron-store'

export const getPath = async (
  chromePathVariable: string,
  dispatchToAppReduxStore: (action: { type: string, payload?: any}) => void,
  logger: ILogger | winston.Logger = Logger
): Promise<string | undefined> => {
  const store = new ElectronStore()

  logger.log('debug', `chromePath`, store.get(chromePathVariable))

  const currentRevision = getCurrentRevision()
  const chromeExecutablePath = getLocalRevision(currentRevision)

  logger.log('debug', `Current revision ${currentRevision} available at path: ${chromeExecutablePath || 'n/a'}`)

  if (!chromeExecutablePath) {
    logger.log('debug', `Downloading correct version of chrome`)
    const latestRevision = await getLatestRevisions()

    if (latestRevision && latestRevision !== currentRevision) {
      dispatchToAppReduxStore({
        payload: {
          actions: `DOWNLOAD_CHROME`,
          text: `Please upgrade the browser`,
          timeout: 2000
        },
        type: `SNACKBAR.SHOW`
      })
    } else {
      dispatchToAppReduxStore({
        payload: {
          action: `DOWNLOAD_CHROME`,
          text: `Please download a modified chrome browser with super powers.`
        },
        type: `SNACKBAR.SHOW`
      })
      return
    }
  } else {
    store.set(chromePathVariable, chromeExecutablePath)
  }

  return store.get(chromePathVariable)
}