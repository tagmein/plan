export function elem<TElement = HTMLDivElement>(
 tagName: string,
 ...classNames: string[]
): TElement {
 const e = document.createElement(tagName)
 if (classNames.length) {
  e.classList.add(...classNames)
 }
 return e as TElement
}
