globalThis.__dirname = ''

import { add_style } from './lib/add_style'
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
`

const app = create_app(function (path: string) {
 location.hash = path
})

function route() {
 app.route(location.hash.substring(1))
}

async function main() {
 document.body.appendChild(app.schedule)
 document.body.appendChild(app.workspace)
 addEventListener('hashchange', route)
 route()
 await create_tables()
}

main().catch(function (e) {
 console.error(e)
})
