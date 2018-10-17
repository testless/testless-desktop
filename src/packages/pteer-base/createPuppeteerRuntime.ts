import { Logger } from 'winston'

import {
  executeScenario,
  ILogger
} from '../../packages/testcases'

import PuppeteerActions from './PuppeteerActions'
import {
  PuppeteerInstance
} from './PuppeteerInstance'

export const executeScenarioWithPuppeteer = (
  keepAliveAfterExecution: boolean = false,
  log: ILogger | Logger
) => executeScenario<PuppeteerInstance>(
  PuppeteerActions,
  async (runtime: PuppeteerInstance) => {
    if (runtime.page && !keepAliveAfterExecution) {
      await runtime.page.close()
      runtime.page = undefined
    }
  },
  log
)
