import * as fs from 'fs'
import * as path from 'path'

import * as Puppeteer from 'puppeteer'

import { IPuppeteerLaunchOptions, PuppeteerInstance } from '../packages/pteer-base'

import Logger from '../Logger'
import { IEvent } from '../packages/preload/_export';

export const createPuppeteerInstance = async (
  dispatch: (action: { type: string, payload?: any}) => void,
  executablePath?: string
) => {

  const width = 700
  const height = 600

  const launchOptions: IPuppeteerLaunchOptions = {
    args: [
      `--window-size=${width},${height}`,
      `--window-position=0,0`
      /* , `--auto-open-devtools-for-tabs` */
    ],
    executablePath,
    headless: false,
    slowMo: 250
  }

  const file = path.join(__dirname, `../../build/bundle.js`)
  Logger.debug(`Loading path ${file}`)
  const preloadScript = fs.readFileSync(file, 'utf8')

  return new PuppeteerInstance({
    beforeNewPage: async (page: Puppeteer.Page) => {
      Logger.info(`Inject preload javascript`)
      await page.exposeFunction('__pomeradeDispatcher', (event: IEvent) => dispatch({
        type: 'RECORDING.ON_EVENT',
        payload: event
      }))
      await page.evaluateOnNewDocument(preloadScript)
    },
    launchOptions
  })
}

export const getCurrentRevision = () => require('puppeteer/package.json').puppeteer.chromium_revision
