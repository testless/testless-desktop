import { ipcRenderer } from 'electron'

import { AppCommunicator } from '../communication'

global.console.log('Preloading script')

AppCommunicator(window, ipcRenderer)
