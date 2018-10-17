import { IEvent } from './getIEventFromEvent'

import overwriteAddEventListener from './overwriteAddEventListener'

declare global {
  interface Window { // tslint:disable-line
    __pomeradeDispatcher?: (payload: IEvent) => void
  }
}

overwriteAddEventListener(window.__pomeradeDispatcher ? window.__pomeradeDispatcher : x => console.log(x))
