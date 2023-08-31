import { add_style } from './add_style'
import { App } from './create_app'
import { Toolbar, create_toolbar } from './create_toolbar'
import { elem } from './element_utils'
import {
 TimeButtonsControl,
 create_time_buttons,
} from './schedule/create_time_buttons'
import {
 TimeWindowControl,
 create_time_window,
} from './schedule/create_time_window'

add_style`
.schedule {
 background-color: #a0a0a0;
 border-right: 1px solid #1b1b1b;
 box-shadow: 0 0 8px #505050;
 display: flex;
 flex-direction: column;
 overflow: hidden;
 width: 300px;
}

.schedule .logo {
 height: 16px;
 width: 16px;
 padding: 12px;
 image-rendering: pixelated;
 cursor: pointer;
 opacity: 0.6;
}

.schedule .logo:hover {
 opacity: 1;
}

.schedule .logo:active {
 opacity: 0.8;
}
`

export interface Schedule extends HTMLDivElement {
 route(path: string): void
 time_buttons: TimeButtonsControl
 time_window: TimeWindowControl
 toolbar: Toolbar
}

export function create_schedule(app: App) {
 const schedule = elem('div', 'schedule') as Schedule
 const logo = elem('img', 'logo')
 logo.setAttribute('src', '/plan-logo.png')
 logo.addEventListener('click', app.navigate_home)
 schedule.toolbar = create_toolbar()
 schedule.toolbar.appendChild(logo)
 schedule.time_buttons = create_time_buttons(
  schedule.toolbar.add_button,
  function (year, month, day, hour) {
   app.navigate_schedule(['', year, month, day, hour].join('/'))
  },
 )
 schedule.time_window = create_time_window()
 schedule.appendChild(schedule.toolbar)
 schedule.appendChild(schedule.time_window.container)
 schedule.route = function (path) {
  const [_, year = '', month = '', day = '', hour = ''] = path.split('/')
  schedule.time_buttons.set_time(year, month, day, hour)
  schedule.time_window.set_time(year, month, day, hour)
 }
 return schedule
}
