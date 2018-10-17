import finder from '@medv/finder'

import {
  getIEventFromEvent,
  IEvent
} from './getIEventFromEvent'

import {
  Extractor
} from './events'

declare global {
  interface EventTarget { // tslint:disable-line:interface-name
    override?: boolean
  }
}

export default (dispatch: (customEvent: IEvent) => void) => {
  if (EventTarget.prototype.override) {
    console.log('Skip overriding overriden EventTarget')
    return
  }

  console.log('Overriding EventTarget')
  const oldAddEventListener = EventTarget.prototype.addEventListener

  EventTarget.prototype.override = true

  console.log(`Overriding handler`)

  EventTarget.prototype.addEventListener = function (
    eventName: keyof DocumentEventMap,
    listener: EventListener | EventListenerObject | null,
    options?: boolean | AddEventListenerOptions
  ) {
    if (!Extractor[eventName]) {
      oldAddEventListener.call(this, eventName, listener, options)
    } else {
      oldAddEventListener.call(this, eventName, (event: Event) => {
        const customEvent: IEvent = getIEventFromEvent(event, eventName as keyof typeof Extractor, finder)
        dispatch(customEvent)

        if (listener && typeof listener === 'function') {
          listener(event)
        } else if (listener) {
          listener.handleEvent(event)
        } else {
          // listener is null, nothing todo
        }
      }, options)
    }
  }

  /*
   * pages with no event listener instantiated,
   * we have to instantiate at least one
   */
  Object.keys(Extractor).forEach(
    eventType => window.addEventListener(eventType, () => {
      // do nothing
    })
  )
}
