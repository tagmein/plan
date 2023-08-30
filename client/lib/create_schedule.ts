import { add_style } from './add_style'
import { App } from './create_app'
import { elem } from './elem'

add_style`
.schedule {
 background-color: #a0a0a0;
 border-right: 1px solid #505050;
 box-shadow: 0 0 8px #505050;
 display: flex;
 flex-direction: column;
 overflow: hidden;
 width: 300px;
}
`

export interface Schedule extends HTMLDivElement {
 route(path: string): void
}

export function create_schedule(app: App) {
 const schedule: Partial<Schedule> = elem('div', 'schedule')
 schedule.route = function (path) {
  console.log('route schedule', path)
 }
 return schedule as Schedule
}
