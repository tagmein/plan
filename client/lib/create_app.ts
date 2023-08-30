import { Schedule, create_schedule } from './create_schedule'
import { Workspace, create_workspace } from './create_workspace'

export interface App {
 schedule: Schedule
 workspace: Workspace
 navigate_schedule(path: string): void
 navigate_workspace(path: string): void
 route(hash: string): void
}

export function create_app(navigate: (path: string) => void): App {
 let current_path = ''
 const PATH_PART_COUNT = 2
 function get_path_parts() {
  const parts = current_path.split('#')
  while (parts.length < PATH_PART_COUNT) {
   parts.push('')
  }
  return parts
 }
 const navigate_part = Array(PATH_PART_COUNT).map(function (index) {
  return function (new_path: string) {
   const paths = get_path_parts()
   paths[index] = new_path
   navigate(paths.join('#'))
  }
 })
 const app: App = {
  navigate_schedule: navigate_part[0],
  navigate_workspace: navigate_part[1],
  route(path) {
   current_path = path
   const current_parts = get_path_parts()
   if (
    current_parts.some(function (part) {
     return part.length === 0 || !part.startsWith('/')
    })
   ) {
    const fixed_parts = current_parts.map(function (part) {
     if (part.length === 0) {
      return '/'
     } else if (!part.startsWith('/')) {
      return `/${part}`
     } else {
      return part
     }
    })
    navigate(fixed_parts.join('#'))
   } else {
    const [schedule_path, workspace_path] = get_path_parts()
    app.schedule.route(schedule_path)
    app.workspace.route(workspace_path)
   }
  },
  schedule: null as unknown as Schedule,
  workspace: null as unknown as Workspace,
 }
 app.schedule = create_schedule(app)
 app.workspace = create_workspace(app)
 return app
}
