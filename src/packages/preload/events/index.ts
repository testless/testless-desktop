import { extract as click } from './click'
import { extract as input } from './input'
import { extract as keydown } from './keydown'

export const Extractor: Record<string, (event: Event, cssSelector: (element: Element) => string) => any> = {
  click,
  input,
  keydown
}

export type ActivatedEvent = keyof typeof Extractor
