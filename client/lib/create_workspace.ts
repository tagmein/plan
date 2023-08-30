import { add_style } from './add_style'
import { App } from './create_app'
import { elem } from './elem'

add_style`
.workspace {
 display: flex;
 flex-direction: column;
 flex-grow: 1;
 overflow-x: hidden;
 overflow-y: auto;
}
`

export interface Workspace extends HTMLDivElement {
 route(path: string): void
}

export function create_workspace(app: App) {
 const workspace = elem('div', 'workspace') as Workspace
 workspace.route = function (path) {
  console.log('route workspace', path)
 }
 return workspace
}
