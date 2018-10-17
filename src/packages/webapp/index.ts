export enum RecordingActionTypes {
  beforeAll = 'RECORDING.BEFORE_ALL',
  afterAll = 'RECORDING.AFTER_ALL',
  afterError = 'RECORDING.AFTER_ERROR',
  beforeEach = 'RECORDING.BEFORE_EACH',
  afterEach = 'RECORDING.AFTER_EACH'
}

declare global {
  interface Window { // tslint:disable-line:interface-name
    __tl__?: {
      config?: {
        showAddTestButtonManual: boolean
      },
      localChrome?: {
        send: (scenario: any) => void,
        close: () => void,
        downloadCorrectRevision: () => void
      }
      getStore?: any
    }
  }
}