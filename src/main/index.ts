import {
  app,
  BrowserWindow,
  ipcMain
} from 'electron'
import * as WindowStateKeeper from 'electron-window-state-manager'

import {
  DISPATCH,
  MainCommunicator
} from '../communication'
import Logger from '../Logger'

class Session {
  private mainWindow: BrowserWindow
  private isDevMode: boolean
  private startURL: string
  private mainWindowState: any

  constructor () {
    this.isDevMode = process.env.NODE_ENV === 'development'

    this.mainWindowState = new WindowStateKeeper('mainWindow', {
      defaultHeight: 1024,
      defaultWidth: this.isDevMode ? 1500 : 1000
    })

    this.mainWindow = new BrowserWindow({
      height: this.mainWindowState.height,
      show: false,
      title: 'testless',
      webPreferences: {
        devTools: this.isDevMode,
        nodeIntegration: false,
        preload: require.resolve('./preload')
      },
      width: this.mainWindowState.width,
      x: this.mainWindowState.x,
      y: this.mainWindowState.y
    })

    this.startURL = this.isDevMode ? process.env.ELECTRON_START_URL || 'https://www.testless.com' : 'https://www.testless.com'

    Logger.info(`Starting "${this.startURL}"`)

    this.mainWindow.loadURL(this.startURL)

    if (this.isDevMode) {
      Logger.info(`This is development mode`)
      this.mainWindow.webContents.openDevTools()
      this.installingDevExentensions()
    }

    const dispatch = (action: {
      type: string,
      payload?: any
    }) => this.mainWindow.webContents.send(DISPATCH, action)

    this.mainWindow.on('ready-to-show', () => {
      this.mainWindow.show()
      this.mainWindow.focus()
      if (this.mainWindowState.maximized) {
        this.mainWindow.maximize()
      }
    })

    this.mainWindow.on('close', () => {
      this.mainWindowState.saveState(this.mainWindow)
    })

    MainCommunicator(ipcMain, this.isDevMode, dispatch)
  }

  private installingDevExentensions () {
    // If Now is dev env - let's call install extentions function:
    if (process.env.NODE_ENV !== 'production') {
      const {
        default: installExtension,
        // REACT_DEVELOPER_TOOLS,
        REDUX_DEVTOOLS
        // REACT_PERF
      } = require('electron-devtools-installer')

      Logger.info('Installing extensions')

      // installExtension(REACT_DEVELOPER_TOOLS)
      //   .then((name) => console.log(`Added Extension:  ${name}`))
      //   .catch((err) => console.log('An error occurred: ', err))
      installExtension(REDUX_DEVTOOLS)
        .then((name) => Logger.info(`Added Extension:  ${name}`))
        .catch((err) => Logger.info('An error occurred: ', err))
      // installExtension(REACT_PERF)
      //   .then((name) => console.log(`Added Extension:  ${name}`))
      //   .catch((err) => console.log('An error occurred: ', err))
    }
  }
}

function start () {
  let session: Session | undefined

  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  app.on('ready', () => {
    Logger.info('Main ready')
    session = new Session()
  })

  // Quit when all windows are closed.
  app.on('window-all-closed', () => {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin' || process.env.NODE_ENV !== 'production') {
      app.quit()
    }
  })

  app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (!session) {
      session = new Session()
    }
  })

  const signals = ['exit', 'SIGINT', 'SIGUSR1', 'SIGUSR2']

  signals.forEach(
    (signal: string) => process.once(signal as NodeJS.Signals, async () => {
      if (session) {
        app.quit()
      }
    })
  )
}

start()

Logger.info('Creating window')
