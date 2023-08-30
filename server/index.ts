import dotenv from 'dotenv'
import express, { Request, Response } from 'express'
import fs from 'fs'
import path from 'path'
import sqlite3 from 'sqlite3'
import { open } from 'sqlite'

dotenv.config()
const port = process.env.PORT
const app = express()

const contentTypes = {
 html: 'text/html',
 ico: 'image/x-icon',
 js: 'application/javascript',
 map: 'text/plain',
}

Object.entries({
 'favicon.ico': '/favicon.ico',
 'index.html': '/',
 'plan-logo.png': '/plan-logo.png',
 'require.js': '/require.js',
}).map(function ([file, url]) {
 const extension = file.split('.').pop() as keyof typeof contentTypes
 const fileContents = fs.readFileSync(file)
 app.get(url, function (req: Request, res: Response) {
  res.status(200)
  res.set({
   'Content-Length': fileContents.length,
   'Content-Type': contentTypes[extension],
  })
  res.end(fileContents)
 })
})

app.use('/client', express.static(path.join(__dirname, '..', 'client-dist')))
app.use('/client', express.static(path.join(__dirname, '..', 'client')))

app.use(express.json())

app.post('/data', async function (req: Request, res: Response, next) {
 try {
  const db = await open({
   filename: path.join(__dirname, '..', 'data', 'example-user.db'),
   driver: sqlite3.cached.Database,
  })
  const result = await db.all(req.body.query)
  const response_data = JSON.stringify(result)
  res.status(200)
  res.set({
   'Content-Length': response_data.length,
   'Content-Type': 'application/json',
  })
  res.end(response_data)
 } catch (err) {
  next(err)
 }
})

app.use(function (
 err: any,
 _: Request,
 res: Response,
 next: (err: any) => void,
) {
 console.error(err)
 if (res.headersSent) {
  return next(err)
 }
 res.status(500)
 res.set({ 'Content-Type': 'application/json' })
 res.end(JSON.stringify({ error: true }))
})

app.listen(port, function () {
 console.log(`[server]: Server is running at http://localhost:${port}`)
})
