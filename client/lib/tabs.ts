import { Toolbar, create_toolbar } from './create_toolbar'
import { elem } from './element_utils'

export interface Tabs {
 container: Toolbar
 count: number
 create(
  id: number,
  label: string,
  is_closeable: boolean,
  is_pinned: boolean,
 ): void
 set_active_tabs(ids: number[], default_label: string): void
 set_tab_label(id: number, label: string): void
}

export interface Tab {
 container: HTMLDivElement
 is_closeable: boolean
 is_pinned: boolean
 label: string
 order: number
 id: number
}

export function tabs(on_change_open_tabs: (ids: number[]) => void) {
 const all_tabs = new Map<string, Tab>()
 const control: Tabs = {
  container: create_toolbar(),
  count: 0,
  create(
   id: number,
   label: string,
   is_closeable: boolean = false,
   is_pinned: boolean = false,
  ) {
   const new_tab: Tab = {
    container: elem('div', 'tab'),
    is_closeable,
    is_pinned,
    label,
    order: 0,
    id,
   }
   new_tab.container.textContent = label
   control.container.appendChild(new_tab.container)
  },
  set_tab_label(id: number, label: string) {},
  set_active_tabs(ids: number[], default_label: string) {
   console.log('set_active_tabs', ids)
  },
 }
 return control
}
