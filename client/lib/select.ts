import { add_style } from './add_style'
import { DELAY } from './constants'
import { closest_visible_element, elem } from './element_utils'

add_style`
.selecting {
 background-color: #a0a0a0 !important;
}
.select_shade {
 background-color: #80808040;
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
 display: flex;
 flex-direction: column;
 min-height: 62px;
 min-width: 42px;
 overflow: hidden;
 position: fixed;
}

.filter_options {
 background-color: transparent;
 border-bottom: 1px solid #1b1b1b;
 border-left: none;
 border-right: none;
 border-top: none;
 box-sizing: border-box;
 flex-shrink: 0;
 font-family: inherit;
 font-size: inherit;
 height: 36px;
 line-height: 34px;
 min-width: 100%;
 padding: 0 8px;
 width: 36px;
}

.select_options {
 flex-grow: 1;
 overflow-x: hidden;
 overflow-y: auto;
 position: relative;
 z-index: 2;
}

.select_options_empty {
 height: 0;
 position: relative;
 z-index: 1;
}

.select_options_empty::after {
 bottom: 0;
 color: #a0a0a0;
 content: 'no match';
 display: block;
 height: 24px;
 left: 0;
 line-height: 22px;
 overflow: hidden;
 padding: 0 8px;
 position: absolute;
 right: 0;
 text-overflow: ellipsis;
 user-select: none;
 white-space: pre;
}

.select_panel .option {
 background-color: #eeeeee;
 cursor: pointer;
 height: 24px;
 line-height: 22px;
 overflow: hidden;
 padding: 0 8px;
 text-overflow: ellipsis;
 user-select: none;
 white-space: pre;
}

.select_panel .option[data-hover="true"] {
 background-color: #c8c8c8;
}

.select_panel .option:active,
.select_panel .option[data-active="true"] {
 background-color: #a0a0a0;
}

.select_panel .option[data-selected="true"] {
 background-color: #1b1b1b;
 color: #eeeeee;
}
`

const select_options_filter_style = add_style``

const select_shade = elem('div', 'select_shade')
let select_shade_remove_timeout: NodeJS.Timeout

export function select({
 element,
 go_next,
 go_prev,
 on_select,
 options,
 selected_value,
}: {
 element: HTMLElement
 go_next(): void
 go_prev(): void
 on_select(value: string): void
 options: [string, string][]
 selected_value?: string
}) {
 clearTimeout(select_shade_remove_timeout)
 let is_frozen = false
 if (typeof (element as any).close_select === 'function') {
  ;(element as any).close_select()
 }
 function select_keyboard_control(event: KeyboardEvent) {
  switch (event.key) {
   case 'Escape':
    close()
    break
   case 'Tab':
    event.preventDefault()
    close()
    setTimeout(() => {
     ;(event.shiftKey ? go_prev : go_next)()
    }, DELAY.INSTANT)
    break
   case 'Enter':
    click_hovered_option()
    break
   case 'ArrowUp':
    event.preventDefault()
    const prev_option = closest_visible_element<HTMLDivElement>(
     hovered_option,
     -1,
    )
    if (prev_option) {
     hover_option(prev_option)
    } else {
     hover_option(
      closest_visible_element<HTMLDivElement>(select_options.lastElementChild),
     )
    }
    break
   case 'ArrowDown':
    event.preventDefault()
    const next_option = closest_visible_element<HTMLDivElement>(
     hovered_option,
     1,
    )
    if (next_option) {
     hover_option(next_option)
    } else {
     hover_option(
      closest_visible_element<HTMLDivElement>(select_options.firstElementChild),
     )
    }
    break
  }
 }
 let is_closing = false
 function close() {
  if (is_closing) {
   return
  }
  is_closing = true
  is_frozen = true
  select_options_filter_style.textContent = ''
  ;(element as any).close_select = undefined
  document.body.removeChild(select_panel)
  select_shade_remove_timeout = setTimeout(function () {
   document.body.removeChild(select_shade)
  }, DELAY.SHORT)
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
  select_panel.style.minWidth = `${Math.max(
   66,
   select_element_bounds.width + 2,
  )}px`
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
 const filter_options = elem<HTMLInputElement>('input', 'filter_options')
 function focus_filter() {
  setTimeout(function () {
   if (is_frozen) {
    return
   }
   filter_options.focus()
  }, DELAY.INSTANT)
 }
 filter_options.addEventListener('blur', function () {
  focus_filter()
 })
 filter_options.addEventListener('keyup', function () {
  if (is_frozen) {
   return
  }
  if (filter_options.value === '') {
   select_options_filter_style.textContent = ''
  } else {
   const filter = JSON.stringify(filter_options.value.toLowerCase())
   select_options_filter_style.textContent = `
.select_options .option {
 display: none;
}
.select_options .option[data-search-label^=${filter}],
.select_options .option[data-search-value^=${filter}] {
 display: block;
}
   `
   hover_option(
    closest_visible_element(hovered_option ?? initial_selected_option),
   )
  }
 })
 filter_options.setAttribute('placeholder', 'filter options')
 focus_filter()
 const select_options = elem('div', 'select_options')
 const select_options_empty = elem('div', 'select_options_empty')
 select_panel.appendChild(filter_options)
 select_panel.appendChild(select_options)
 select_panel.appendChild(select_options_empty)
 let initial_selected_option: HTMLDivElement | null = null
 let hovered_option: HTMLDivElement | null = null
 function hover_option(option: HTMLDivElement | null) {
  hovered_option?.removeAttribute('data-hover')
  hovered_option = option
  hovered_option?.setAttribute('data-hover', 'true')
  hovered_option?.scrollIntoView?.({
   behavior: 'smooth',
   block: 'nearest',
   inline: 'nearest',
  })
 }
 function click_hovered_option() {
  if (is_frozen) {
   return
  }
  if (!hovered_option) {
   return
  }
  const value = hovered_option.getAttribute('data-value')
  if (typeof value === 'string') {
   is_frozen = true
   hovered_option.setAttribute('data-active', 'true')
   setTimeout(function () {
    close()
    on_select(value)
   }, DELAY.MEDIUM)
  }
 }
 select_options.addEventListener('mouseover', function (event) {
  if (is_frozen) {
   return
  }
  if ((event.target as HTMLDivElement).classList.contains('option')) {
   hover_option(event.target as HTMLDivElement)
  }
 })
 select_options.addEventListener('click', function (event) {
  if (is_frozen) {
   return
  }
  if ((event.target as HTMLDivElement).classList.contains('option')) {
   hover_option(event.target as HTMLDivElement)
   click_hovered_option()
  }
 })
 for (const [value, label] of options) {
  const option = elem('div', 'option')
  option.textContent = label
  select_options.appendChild(option)
  option.setAttribute('data-value', value)
  option.setAttribute('data-search-value', value.trim().toLowerCase())
  option.setAttribute('data-search-label', label.trim().toLowerCase())
  if (value === selected_value) {
   initial_selected_option = option
   option.setAttribute('data-selected', 'true')
   hover_option(option)
   setTimeout(function () {
    option.scrollIntoView({
     behavior: 'smooth',
     block: 'center',
     inline: 'center',
    })
   }, DELAY.INSTANT)
  }
 }
 document.body.appendChild(select_panel)
 reposition()
 addEventListener('resize', reposition)
}
