export enum StepType {
    START_STORY = 'START_STORY',
    GOTO_URL = 'GOTO_URL',
    CLICK = 'CLICK',
    SET_INPUT = 'SET_INPUT'
}
  

export enum MachineTypes {
    PUPPETEER_TEST = 'PUPPETEER_TEST',
    PUPPETEER_LIVE = 'PUPPETEER_LIVE'
}

export interface IScenario {
    exceptionThrown?: any // in case an exception was thrown save it here for debugging purposes
    executionCouldFinish?: boolean // whether error was thrown by execution, error referring to technical error not test failing
    machineConfig?: any // additional configuration details for the machine
    machineDetails?: any // additional details from the machine fo debugging purposes
    machineType: MachineTypes // type of machine Running this test
    mailSendDate?: number
    results: any[] // results of the execution
    stepStart: number[] // timestamps when step started to be executed
    stepStop: number[] // timestamps when step was finishes to be executed (error or success)
    testStart?: Date // date of start of test
    testStop?: Date // date of stop of test
    userSteps: StepType[] // categories of steps
    userStepsArgs: string[][] // additional arguments for each step
    storyID: string // related story
}