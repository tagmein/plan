export function add_style([text]: TemplateStringsArray) {
 const style_element = document.createElement('style')
 style_element.textContent = text
 document.head.appendChild(style_element)
}
