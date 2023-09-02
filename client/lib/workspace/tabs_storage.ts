import { run_query } from '../run_query'

export const tabs_storage = {
 async get_all() {
  const results = await run_query('select * from tabs')
  console.log({ results })
 },
}
