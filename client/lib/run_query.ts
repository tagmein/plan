export async function run_query(query: string) {
 const response = await fetch('/data', {
  method: 'POST',
  headers: {
   'Content-Type': 'application/json',
  },
  body: JSON.stringify({
   query,
  }),
 })
 return response.json()
}
