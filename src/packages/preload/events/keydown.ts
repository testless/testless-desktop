export interface ICustomKeyboardEvent {
  css?: string
  value?: string
  label?: string
  code: string
  altKey: boolean
  ctrlKey: boolean
  metaKey: boolean
  shiftKey: boolean
  key: string
}

export const extract = (event: Event, cssSelector: (element: Element) => string): ICustomKeyboardEvent | { error: string } => { // tslint:disable-line:no-shadowed-variable
  if (!(event instanceof KeyboardEvent)) {
    const error = `Event for 'click' is of type ${event.constructor.name}, not of type KeyboardEvent`
    console.error(error, event)
    return { error }
  }

  const customEvent = {
    altKey: event.altKey,
    code: event.code,
    ctrlKey: event.ctrlKey,
    key: event.key,
    metaKey: event.metaKey,
    shiftKey: event.shiftKey
  }

  const target = event.target || event.currentTarget
  if (!target) {
    return customEvent
  }

  if (target instanceof HTMLInputElement) {
    return {
      ...customEvent,
      css: cssSelector(target),
      label: target.textContent || undefined,
      value: target.value
    }
  } else {
    const error = `Event's target is not of type HTMLInputElement`
    console.error(error, target, event)
    return { error }
  }
}
