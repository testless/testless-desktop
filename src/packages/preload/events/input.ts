export interface ICustomInputEvent {
  css?: string
  value?: string
  label?: string
}

export const extract = (event: Event, cssSelector: (element: Element) => string): ICustomInputEvent | { error: string } => { // tslint:disable-line:no-shadowed-variable
  if (!(event instanceof UIEvent)) {
    const error = `Event for 'input' is of type ${event.constructor.name}, not of type UIEvent`
    console.error(error, event)
    return { error }
  }

  const target = event.target || event.currentTarget
  if (!target) {
    const error = `Even has no target`
    console.error(error, event)
    return { error }
  }

  if (target instanceof HTMLInputElement) {
    return {
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
