
import {
  IpcMain,
  IpcRenderer
} from 'electron'

import * as ElectronStore from 'electron-store'

import { executeScenario } from './executeScenario'
import { getPath } from './getPath'

import { PuppeteerInstance } from './packages/pteer-base'

import Logger from './Logger'
import { getCurrentRevision } from './main/createPuppeteerInstance'
import {
  downloadRevision,
} from './main/downloadChromeRevision'
/**
 * Send from app to main
 */
const SEND_TO_BE_EXECUTED = `app.to_be_executed`
const SEND_TO_BE_CLOSED = `app.to_be_closed`
const SEND_TO_DOWNLOAD_CORRECT_REVISION = `app.download_correct_revision`



/**
 * Send from main to app
 */
export const DISPATCH = `main.test_case.dispatch`

/**
 * @param window window variable in electron browser environment
 * @param ipcRenderer render thread for browser environment
 */
export const AppCommunicator = (window: Window, ipcRenderer: IpcRenderer) => {
  window.__tl__ = window.__tl__ || {}
  window.__tl__.localChrome = {
    close: () => {
      ipcRenderer.send(SEND_TO_BE_CLOSED)
    },
    downloadCorrectRevision: () => {
      ipcRenderer.send(SEND_TO_DOWNLOAD_CORRECT_REVISION)
    },
    send: (scenario) => {
      ipcRenderer.send(SEND_TO_BE_EXECUTED, scenario)
    }
  }

  ipcRenderer.on(DISPATCH, (event: any, action: { type: string, payload?: any}) => {
    console.debug(DISPATCH, action)
    if (window.__tl__ && window.__tl__ .getStore()) {
      window.__tl__ .getStore().dispatch(action)
    } else {
      throw new Error(`@packages/electro/ communication: Expected ${window} to have variables __tl__ and getStore`)
    }
  })
} // tslint:disable-line:ter-indent


export const MainCommunicator = (
  ipcMain: IpcMain,
  isDevMode: boolean,
  dispatchToAppReduxStore: (action: { type: string, payload?: any}) => void
) => {

  const chromePathVariable = `chromeExecutablePath`

  let puppeteerInstance: PuppeteerInstance | undefined

  ipcMain.on(SEND_TO_BE_EXECUTED, executeScenario(
    isDevMode,
    dispatchToAppReduxStore,
    puppeteerInstance,
    () => getPath(
      chromePathVariable,
      dispatchToAppReduxStore,
      Logger
    )
  ))

  ipcMain.on(SEND_TO_BE_CLOSED, async (event: any) => {
    Logger.debug('CLOSE')

    try {
      if (puppeteerInstance) {
        await puppeteerInstance.close()
      }
    } catch (e) {
      Logger.error(e)
    }
  })

  ipcMain.on(SEND_TO_DOWNLOAD_CORRECT_REVISION, async (event: any) => {
    let progress = 0
    const executablePath = await downloadRevision(
      getCurrentRevision(),
      (downloadedBytes: number, totalBytes: number) => {
        const newProgress = Math.floor(downloadedBytes / totalBytes * 100)
        Logger.debug(`Downloading chromium: ${downloadedBytes} of ${totalBytes}`)

        if (newProgress > progress) {
          progress = newProgress

          dispatchToAppReduxStore({
            payload: {
              lockBackground: true,
              progress,
              text: `${progress}% Downloading modified chrome browser...`
            },
            type: `SNACKBAR.SHOW`
          })
        }
      }
    )

    dispatchToAppReduxStore({
      payload: {
        level: 'success',
        text: `Thank you for your patience. Browser has been downloaded successfully. You can now record your tests.`,
        timeout: 5000
      },
      type: `SNACKBAR.SHOW`
    })

    const store = new ElectronStore()
    store.set(chromePathVariable, executablePath)
  })
}
