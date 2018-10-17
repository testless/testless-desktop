import * as Puppeteer from 'puppeteer'

import { IPuppeteerInstance } from './PuppeteerActions'

// import { guessChromePath } from './guessChromePath'
import Logger from '../../Logger'

export interface IPuppeteerLaunchOptions {
  args?: string[]
  slowMo?: number
  executablePath?: string
  headless?: boolean
}

export interface IPuppeteerProps {
  beforeNewPage?: (page: Puppeteer.Page) => Promise<void>
  launchOptions?: Puppeteer.LaunchOptions,
  guessLocalChromePath?: boolean,
  connectOptions?: Puppeteer.ConnectOptions
}

export class PuppeteerInstance implements IPuppeteerInstance {
  public browser?: Puppeteer.Browser
  public page?: Puppeteer.Page

  private props: IPuppeteerProps

  constructor (
    props: IPuppeteerProps = {
      launchOptions: {}
    }
  ) {
    this.props = props
  }

  public async getBrowser (allowCreateNewBrowser: boolean = false): Promise<Puppeteer.Browser> {
    if (this.browser) {
      return Promise.resolve(this.browser)
    } else if (allowCreateNewBrowser) {
      const {
        connectOptions
      } = this.props
      const browser = connectOptions ? await Puppeteer.connect(connectOptions) : await Puppeteer.launch(this.getOptions())
      this.browser = browser
      return browser
    } else {
      throw new Error(`PuppeteerInstance: getBrowser with allowCreateNewBrowser=false was called, but no instance of browser available`)
    }
  }

  public async getPage (forceCreateNewPage: boolean = false, allowCreateNewBrowser: boolean = false): Promise<Puppeteer.Page> {
    if (forceCreateNewPage) {
      const browser = await this.getBrowser(allowCreateNewBrowser).catch(
        () => {
          throw new Error(`PuppeteerInstance: getPage with allowCreateNewBrowser=false was called, but no instance of browser available`)
        }
      )
      this.page = await browser.newPage()

      if (this.props.beforeNewPage) {
        await this.props.beforeNewPage(this.page)
      }

      return this.page
    } else if (this.page) {
      return Promise.resolve(this.page)
    } else {
      throw new Error(`PuppeteerInstance: getPage with allowCreateNewPage=false was called, but no instance of page available`)
    }
  }

  public async smokeTest () {
    await this.getPage(true, true)

    if (!this.page) {
      Logger.error(`PuppeteerInstance: smoke test failed.`)
      throw Error(`PuppeteerInstance:smoke test failed.`)
    }

    await this.page.goto('https://example.com')
    const dimensions = await this.page.evaluate(() => {
      return {
        deviceScaleFactor: window.devicePixelRatio,
        height: document.documentElement ? document.documentElement.clientHeight : 0,
        width: document.documentElement ? document.documentElement.clientWidth : 0
      }
    })

    const content = await this.page.content()

    Logger.info(`width`, dimensions)
    Logger.info(content)

    await this.close()
  }

  public async close () {
    if (this.browser) {
      try {
        if (this.page) {
          await this.page.close().catch((e: any) => Logger.error(`Not able to close page`, e))
        }
        await this.browser.close().catch((e: any) => Logger.error(`Not able to close browser`, e))
      } catch (e) {
        Logger.error(`Error closing the puppeteerInstance`, e)
      }
    }
    this.browser = undefined
    this.page = undefined
  }

  private getOptions (launchOptions = this.props.launchOptions): Puppeteer.LaunchOptions {
    const options: Puppeteer.LaunchOptions = {
      ...launchOptions
    }

    if (this.props.guessLocalChromePath && !options.executablePath) {
      try {
        // options.executablePath = guessChromePath()
        Logger.info(`Using chrome/chromium at ${options.executablePath}`)
      } catch (e) {
        Logger.error(`Not able to find chrome/chromium`, e)
        Logger.info(`Use chromium version being shipped with npm.`)
      }
    } else if (!this.props.guessLocalChromePath && !options.executablePath) {
      Logger.info(`Use chromium version being shipped with npm.`)
    } else if (options.executablePath) {
      Logger.info(`Using chrome/chromium at ${options.executablePath} injected to class.`)
    }

    return options
  }
}
