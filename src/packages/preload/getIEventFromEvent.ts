import { Extractor } from './events'

export interface IEvent<T = any> {
  category: string
  name: keyof typeof Extractor
  args: T
  timestamp: number
}

export const getIEventFromEvent = <T> (
  event: Event,
  name: keyof typeof Extractor,
  cssSelector: (element: Element) => string
): IEvent<T> => {
  const extract = Extractor[name]
  return {
    args: extract(event, cssSelector),
    category: event.constructor.name,
    name,
    timestamp: Date.now()
  }
}
