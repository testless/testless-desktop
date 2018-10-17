const {
  MachineTypes,
  StepType
} = require('../app/packages/api-types')

const { executeScenario } = require('../app/executeScenario')
const { createPuppeteerInstance } =  require('../app/main/createPuppeteerInstance')

const fromStory = (story, machineType, machineConfig) => {
  return {
    machineConfig,
    machineType,
    results: [],
    stepStart: [],
    stepStop: [],
    storyID: story.uuid,
    userSteps: story.userSteps,
    userStepsArgs: story.userStepsArgs
  }
}

const run = async () => {
  const puppeteerInstance = await createPuppeteerInstance((e) => {
    console.log(e)
  }, false, { get: (x) => undefined, set: (x, y) => console.log(x, y) } )

  const scenario = fromStory({
    title: '',
    userSteps: [StepType.START_STORY, StepType.GOTO_URL],
    userStepsArgs: [[], ['https://www.google.de']],
    uuid: ''
  }, MachineTypes.PUPPETEER_LIVE)

  await executeScenario(
    true,
    x => console.log('dispatch', x),
    puppeteerInstance,
    () => Promise.resolve('/Applications/Google Chrome.app'),
    {
      log: (...args) =>console.log(...args)
    }
  )(null, scenario)

  await puppeteerInstance.close()
}

run()
