export function elem(tagName: string, ...classNames: string[]) {
 const e = document.createElement(tagName)
 if (classNames.length) {
  e.classList.add(...classNames)
 }
 return e
}
