import { add_style } from './add_style'
import { elem } from './elem'

add_style`
.selecting {
 background-color: #a0a0a0 !important;
}
.select_shade {
 background-color: #00000040;
 position: fixed;
 top: 0;
 left: 0;
 right: 0;
 bottom: 0;
}

.select_panel {
 background-color: #eeeeee;
 border: 1px solid #1b1b1b;
 box-shadow: 0 0 8px #00000040;
 box-sizing: border-box;
 color: #1b1b1b;
 min-height: 42px;
 min-width: 42px;
 overflow-x: hidden;
 overflow-y: auto;
 position: fixed;
}

.select_panel .option {
 cursor: pointer;
 height: 24px;
 line-height: 22px;
 overflow: hidden;
 padding: 0 8px;
 text-overflow: ellipsis;
 user-select: none;
 white-space: pre;
}

.select_panel .option:hover {
 background-color: #c8c8c8;
}

.select_panel .option:active {
 background-color: #a0a0a0;
}
`

export function select(
 element: HTMLElement,
 options: [string, string][],
 on_select: (value: string) => void,
) {
 if (typeof (element as any).close_select === 'function') {
  ;(element as any).close_select()
 }
 const select_shade = elem('div', 'select_shade')
 function select_keyboard_control(event: KeyboardEvent) {
  if (event.key === 'Escape') {
   close()
   return
  }
 }
 function close() {
  ;(element as any).close_select = undefined
  document.body.removeChild(select_panel)
  document.body.removeChild(select_shade)
  element.classList.remove('selecting')
  removeEventListener('keydown', select_keyboard_control)
  removeEventListener('resize', reposition)
 }
 function reposition() {
  const select_constraint_horizontal =
   element.parentElement!.getBoundingClientRect()
  const select_element_bounds = element.getBoundingClientRect()
  const select_bounds_top = select_element_bounds.bottom
  const select_bounds_left = select_element_bounds.left
  select_panel.style.left = `${select_bounds_left - 1}px`
  select_panel.style.top = `${select_bounds_top}px`
  select_panel.style.maxHeight = `${innerHeight - select_bounds_top}px`
  select_panel.style.maxWidth = `${select_constraint_horizontal.width}px`
  select_panel.style.minWidth = `${select_element_bounds.width + 2}px`
 }
 ;(element as any).close_select = close
 element.classList.add('selecting')
 addEventListener('keydown', select_keyboard_control)
 select_shade.addEventListener('click', close)
 document.body.appendChild(select_shade)
 const select_panel = elem('div', 'select_panel')
 const element_style = getComputedStyle(element)
 select_panel.style.fontFamily = element_style.fontFamily
 select_panel.style.fontSize = element_style.fontSize
 select_panel.style.textAlign = element_style.textAlign
 for (const [value, label] of options) {
  const option = elem('div', 'option')
  option.textContent = label
  select_panel.appendChild(option)
  option.addEventListener('click', function () {
   close()
   on_select(value)
  })
 }
 document.body.appendChild(select_panel)
 reposition()
 addEventListener('resize', reposition)
}
