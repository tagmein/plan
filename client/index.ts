import './environment'

import { add_style } from './lib/add_style'
import { DELAY } from './lib/constants'
import { create_app } from './lib/create_app'
import { create_tables } from './lib/create_tables'

add_style`
body {
 background-color: #808080;
 color: #000000;
 display: flex;
 flex-direction: row;
 height: 100vh;
 margin: 0;
 overflow: hidden;
 padding: 0;
}

*:focus {
 box-shadow: inset 0 0 0 2px #eeeeee;
 outline: none;
}
`

let internal_path: string = location.hash.substring(1)
let write_location_timeout: NodeJS.Timeout

const app = create_app(function (path: string) {
 route(path)
 clearTimeout(write_location_timeout)
 write_location_timeout = setTimeout(function () {
  location.hash = internal_path
 }, DELAY.LONG)
})

function route(path: string) {
 internal_path = path
 app.route(internal_path)
}

async function main() {
 document.body.appendChild(app.schedule)
 document.body.appendChild(app.workspace)
 addEventListener('hashchange', function () {
  const next_path = location.hash.substring(1)
  if (next_path !== internal_path) {
   route(next_path)
  }
 })
 route(internal_path)
 await create_tables()
}

main().catch(function (e) {
 console.error(e)
})
