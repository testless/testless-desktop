import * as winston from 'winston'

import {
  IExecutionHooks,
  StepResults,
  ILogger
} from './packages/testcases'

import {
  IScenario
} from './packages/api-types'

import {
  RecordingActionTypes
} from './packages/webapp'

import { executeScenarioWithPuppeteer, PuppeteerInstance } from './packages/pteer-base'

import Logger from './Logger'
import { createPuppeteerInstance } from './main/createPuppeteerInstance'

export const executeScenario = (
  isDevMode: boolean,
  dispatchToAppReduxStore: (action: { type: string, payload?: any}) => void,
  puppeteerInstance: PuppeteerInstance | undefined,
  getPath: () => Promise<string | undefined>,
  logger: ILogger | winston.Logger = Logger
) => {
  const promisifyAction = (name: keyof IExecutionHooks) => async (
    scenario: IScenario,
    stepIndex?: number,
    result?: StepResults,
    error?: any
  ): Promise<IScenario> => {
    logger.log('debug', `Start hook`, scenario, stepIndex)
    const actionDefinition = RecordingActionTypes[name]

    if (!actionDefinition) {
      throw new Error(`Electro.communication.MainCommunicator: No actiondefinition for name ${name}`)
    }

    const action = {
      type: actionDefinition,
      payload: { scenario, stepIndex, result, error }
    }
    logger.log('debug', `Action`, action)

    dispatchToAppReduxStore(action)

    return scenario
  }

  const hooks: IExecutionHooks = {
    afterAll: promisifyAction('afterAll'),
    afterEach: promisifyAction('afterEach'),
    afterError: (scenario: IScenario, stepIndex: number, error?: any) => promisifyAction('afterError')(scenario, stepIndex, undefined, error),
    beforeAll: (scenario: IScenario) => promisifyAction('beforeAll')(scenario),
    beforeEach: promisifyAction('beforeEach')
  }

  return async (event: any, scenario: IScenario) => {
    if (puppeteerInstance) {
      puppeteerInstance.close()
    }
    
    const chromeExecutablePath = await getPath()

    if (!chromeExecutablePath && !isDevMode) {
      logger.log('info', 'No chrome executable path. Skipping execution.')
      return
    }

    puppeteerInstance = await createPuppeteerInstance(dispatchToAppReduxStore, chromeExecutablePath)

    logger.log('debug', 'TO_BE_EXECUTED_BY_PUPPETEER', scenario)

    try {
      await executeScenarioWithPuppeteer(
        true, logger
      )(puppeteerInstance, scenario, hooks)
    } catch (e) {
      logger.log('error', e.message, e)
    }
  }
}