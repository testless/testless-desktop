export interface ICustomMouseEvent {
  css: string
  label?: string
}

export const extract = (
  event: Event,
  cssSelector: (element: Element) => string
): ICustomMouseEvent | undefined => { // tslint:disable-line:no-shadowed-variable
  if (!(event instanceof MouseEvent)) {
    const message = `Event for 'click' is not of type MouseEvent`
    console.error(message, event)
    return undefined
  }
  const target = event.target || event.currentTarget
  if (!target) {
    const message = `Event has neither target nor currentTarget`
    console.error(message, event)
    throw new Error(message)
  }

  if (target instanceof Element) {
    return {
      css: cssSelector(target),
      label: target.textContent || undefined
    }
  } else {
    const message = `Event's target is not of type Element`
    console.error(message, target, event)
    return undefined
  }
}
