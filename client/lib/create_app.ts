import { Schedule, create_schedule } from './create_schedule'
import { Workspace, create_workspace } from './create_workspace'

export interface App {
 schedule: Schedule
 workspace: Workspace
 navigate_home(): void
 navigate_schedule(path: string, internal?: boolean): void
 navigate_workspace(path: string, internal?: boolean): void
 route(hash: string, internal?: boolean): void
}

export function create_app(
 navigate: (path: string, internal?: boolean) => void,
): App {
 let current_path = ''
 const PATH_PART_COUNT = 2
 function get_path_parts() {
  const parts = current_path.split('#')
  while (parts.length < PATH_PART_COUNT) {
   parts.push('')
  }
  return parts
 }
 const navigate_part = Array(PATH_PART_COUNT)
  .fill(null)
  .map(function (_, index) {
   return function (new_path: string, internal?: boolean) {
    const paths = get_path_parts()
    paths[index] = new_path
    navigate(paths.join('#'), internal)
   }
  })
 let last_schedule_path: string | undefined
 let last_workspace_path: string | undefined
 const app: App = {
  navigate_home: function () {
   navigate(Array(PATH_PART_COUNT).fill('').join('#'))
  },
  navigate_schedule: navigate_part[0],
  navigate_workspace: navigate_part[1],
  route(path, internal) {
   current_path = path
   const [schedule_path, workspace_path] = get_path_parts()
   if (last_schedule_path !== schedule_path) {
    app.schedule.route(schedule_path, internal)
    last_schedule_path = schedule_path
   }
   if (last_workspace_path !== workspace_path) {
    app.workspace.route(workspace_path, internal)
    last_workspace_path = workspace_path
   }
  },
  schedule: null as unknown as Schedule,
  workspace: null as unknown as Workspace,
 }
 app.schedule = create_schedule(app)
 app.workspace = create_workspace(app)
 return app
}
