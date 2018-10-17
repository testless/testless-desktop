import * as Puppeteer from 'puppeteer'

import Logger from '../../Logger'

import { IExecutionRuntime, StepResults } from '../../packages/testcases'

export interface IPuppeteerInstance {
  getPage: (forceCreateNewPage?: boolean, allowNewBrowser?: boolean) => Promise<Puppeteer.Page>
}

const PuppeteerActions: IExecutionRuntime<IPuppeteerInstance> = {
  CLICK: {
    execute: async (puppeteerInstance, data) => {
      const page = await puppeteerInstance.getPage()
      const css = data[0]
      try {
        await page.waitForSelector(css)
      } catch (e) {
        return StepResults.NO_SUCH_ELEMENT
      }

      await page.click(css)

      return StepResults.SUCCESS
    }
  },
  GOTO_URL: {
    execute: async (puppeteerInstance, data) => {
      const page = await puppeteerInstance.getPage()
      const url = data[0]

      const [error, response] = await page.goto(url, {
        waitUntil: `networkidle2`
      }).then(
        (x: Puppeteer.Response) => [undefined, x],
        (e: any) => [e, undefined]
      )
      if (error) {
        return StepResults.FAILED
      } else if (response && response.ok()) {
        return StepResults.SUCCESS
      } else {
        return StepResults.FAILED
      }
    }
  },
  SET_INPUT: {
    execute: async (puppeteerInstance, data) => {
      const page = await puppeteerInstance.getPage()
      const [inputValue, css] = data

      try {
        await page.waitForSelector(css)
      } catch (e) {
        return StepResults.NO_SUCH_ELEMENT
      }

      const value = await page.$eval(css, (target: HTMLInputElement) => target.value)
      await page.focus(css)
      if (!value || typeof value !== 'string') { // tslint:disable-line:strict-type-predicates
        await page.type(css, inputValue)
        return StepResults.SUCCESS
      } else if (inputValue.startsWith(value)) {
        await page.type(css, inputValue.substring(value.length))
        return StepResults.SUCCESS
      } else {
        for (let j = value.length; j > 0; j--) {
          if (inputValue.startsWith(value.substring(0, j))) {
            await page.type(css, inputValue.substring(j))
            break
          } else {
            await page.keyboard.press('Backspace')
          }
        }

        return StepResults.SUCCESS
      }
    }
  },
  START_STORY: {
    execute: async (puppeteerInstance) => {
      Logger.info(`Execute start story`)
      await puppeteerInstance.getPage(true, true)

      return StepResults.SUCCESS
    }
  }
}

export default PuppeteerActions
