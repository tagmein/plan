import { add_style } from './add_style'
import { App } from './create_app'
import { TimeButtonsControl, create_time_buttons } from './create_time_buttons'
import { Toolbar, create_toolbar } from './create_toolbar'
import { elem } from './elem'

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
 time_buttons: TimeButtonsControl
 toolbar: Toolbar
 route(path: string): void
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
 schedule.appendChild(schedule.toolbar)
 schedule.route = function (path) {
  const [_, year = '', month = '', day = '', hour = ''] = path.split('/')
  schedule.time_buttons.set_time(year, month, day, hour)
 }
 return schedule
}
