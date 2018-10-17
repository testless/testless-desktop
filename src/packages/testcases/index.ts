import { Logger as WinstonLogger } from 'winston'

import { IScenario, StepType } from '../../packages/api-types'

export enum StepResults {
  SUCCESS = 'success',
  RECORDED = 'recorded',
  FAILED = 'failed',
  EXCEPTION = 'technical exception thrown',
  NO_SUCH_ELEMENT = 'no such element',
  STATUS_CODE_500 = 'status code 500',
  STATUS_CODE_401 = 'status code 400',
  URL_NOT_VALID = 'Url is not valid',
  URL_IS_NOT_REACHABLE = 'Url is not reachable'
}

export interface IExecutionHooks {
  beforeAll: (scenario: IScenario) => any
  beforeEach: (scenario: IScenario, stepIndex: number) => any
  afterEach: (scenario: IScenario, stepIndex: number, result: StepResults) => any
  afterError: (scenario: IScenario, stepIndex: number, error: any) => any
  afterAll: (scenario: IScenario) => any
}

export interface IExecutionRoutine<S, T extends StepResults> {
  execute: (instance: S, data: string[]) => Promise<T>
}

export interface IExecutionRuntime<S> extends Record<StepType, IExecutionRoutine<S, StepResults>> {
  START_STORY: IExecutionRoutine<S, StepResults.SUCCESS>
  GOTO_URL: IExecutionRoutine<S, StepResults.SUCCESS | StepResults.FAILED>
  CLICK: IExecutionRoutine<S, StepResults.SUCCESS | StepResults.NO_SUCH_ELEMENT>
  SET_INPUT: IExecutionRoutine<S, StepResults.SUCCESS | StepResults.NO_SUCH_ELEMENT>
}

const handleHook = (
  hooks: IExecutionHooks,
  name: keyof IExecutionHooks,
  scenario: IScenario,
  stepIndex?: number,
  resultOrError?: StepResults | any
): void => {
  const hook = hooks[name] as (
    scenario: IScenario,
    stepIndex?: number,
    resultOrError?: StepResults | any
  ) => void

  hook(scenario, stepIndex, resultOrError)
}

export interface ILogger {
  log: (level: string, message: string, ...args: any[]) => void,
}

const doNothingHook = (
  logger: ILogger,
  namespace: string,
  level: 'info' | 'error' | 'silly' = 'info'
) => (scenario: IScenario, stepIndex?: number, resultOrError?: StepResults | any) => {
  logger.log(level, `ExecutionHook ${namespace}`, scenario, stepIndex)
}

export const defaultHooks = (log: ILogger): IExecutionHooks => ({
  afterAll: doNothingHook(log, 'afterAll'),
  afterEach: doNothingHook(log, 'afterEach', 'info'),
  afterError: doNothingHook(log, 'afterError', 'error'),
  beforeAll: doNothingHook(log, 'beforeAll'),
  beforeEach: doNothingHook(log, 'beforeEach')
})

const executeStep = <X> (runtime: X, iexecutionRuntime: IExecutionRuntime<X>, type: StepType, args: string[]) => {
  const executor = iexecutionRuntime[type]
  if (!executor) {
    throw new Error(`No executor for step ${type} available.`)
  }

  return executor.execute(runtime, args)
}

export const executeScenario = <X extends { close: () => Promise<void> }> (
    iexecutionRuntime: IExecutionRuntime<X>,
    cleanupAfterExecution: (runtime: X) => Promise<void>,
    logger: ILogger | WinstonLogger
  ) => async (
    runtime: X,
    scenario: IScenario,
    hooks: IExecutionHooks = defaultHooks(logger)
  ): Promise<IScenario> => {

    handleHook(hooks, 'beforeAll', scenario)

    logger.log('silly' , 'Scenario', scenario)

    const steps = scenario.userSteps

    const tests = steps.map((step, index) => ({
      args: scenario.userStepsArgs[index],
      type: step
    }))

    logger.log('silly', 'Executing', tests)

    for (let stepIndex = 0; stepIndex < tests.length; stepIndex++) { // tslint:disable-line:prefer-for-of
      const test = tests[stepIndex]
      handleHook(hooks, 'beforeEach', scenario, stepIndex)

      const promise: Promise<StepResults> = executeStep<X>(runtime, iexecutionRuntime, test.type, test.args)
      const [error, result] = await promise.then(
          (x: StepResults) => [undefined, x],
          (e: any) => [e, undefined]
        )

      logger.log('silly', `Test Results`, [error, result])
      if (error) {
        handleHook(hooks, 'afterError', scenario, stepIndex, error)
        return scenario
      }

      handleHook(hooks, 'afterEach', scenario, stepIndex, result)
    }

    handleHook(hooks, 'afterAll', scenario)

    await cleanupAfterExecution(runtime)

    return scenario
  }