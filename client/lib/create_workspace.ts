import { add_style } from './add_style'
import { App } from './create_app'
import { elem } from './element_utils'
import { Tabs, tabs } from './tabs'
import { PlanDocument, create_document } from './workspace/create_document'
import { tabs_storage } from './workspace/tabs_storage'

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
 route(path: string, internal?: boolean): void
 tabs: Tabs
}

export function create_workspace(app: App) {
 const open_documents = new Map<string, PlanDocument>()

 function close_doc(plan_doc: PlanDocument) {
  workspace.removeChild(plan_doc)
  open_documents.delete(plan_doc.path)
 }

 function open_doc(path: string) {
  const plan_doc = create_document(path)
  workspace.appendChild(plan_doc)
  open_documents.set(path, plan_doc)
 }

 const workspace = elem('div', 'workspace') as Workspace
 workspace.route = function (path, internal) {
  const open_tabs = path
   .split(';')
   .filter((x) => x.length)
   .map((x) => parseInt(x, 10))
   .filter((x) => !isNaN(x))
  workspace.tabs.set_active_tabs(open_tabs, 'Loading...')
 }
 workspace.tabs = tabs((ids: number[]) => {
  app.navigate_workspace(ids.map((x) => x.toString(10)).join(';'))
 })
 workspace.appendChild(workspace.tabs.container)
 tabs_storage.get_all().then((tabs) => {
  console.log({ tabs })
 })
 return workspace
}
