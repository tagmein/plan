import { add_style } from './add_style'
import { elem } from './element_utils'

add_style`
.toolbar {
 background-color: #535353;
 border-bottom: 1px solid #1b1b1b;
 box-shadow: 0 0 8px #505050;
 box-sizing: border-box;
 display: flex;
 flex-direction: row;
 flex-shrink: 0;
 height: 41px;
 overflow: hidden;
 z-index: 3;
}

.toolbar button {
 background-color: transparent;
 border-radius: 0;
 border: none;
 color: #eeeeee;
 cursor: pointer;
 flex-grow: 1;
 font-family: monospace;
 line-height: 20px;
 min-width: 40px;
 padding: 6px 8px 8px;
 position: relative;
 text-align: center;
 white-space: pre;
}

.toolbar button:hover {
 background-color: #646464;
}

.toolbar button:active {
 background-color: #424242;
}
`

export interface Toolbar extends HTMLDivElement {
 add_button(label: string, on_click: () => void): HTMLButtonElement
}

export function create_toolbar() {
 const toolbar = elem('div', 'toolbar') as Toolbar
 toolbar.add_button = function (label, on_click) {
  const button = elem<HTMLButtonElement>('button')
  button.textContent = label
  button.addEventListener('click', on_click)
  toolbar.appendChild(button)
  return button
 }
 return toolbar
}
