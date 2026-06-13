// Shared DB connection helper for our import/inspect scripts.
// Reads MONGODB_URI from .env.local (no extra deps needed).
const fs = require('fs')
const path = require('path')
const mongoose = require('mongoose')

function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env.local')
  const raw = fs.readFileSync(envPath, 'utf8')
  for (const line of raw.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
    if (!m) continue
    let val = m[2]
    if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1)
    if (!process.env[m[1]]) process.env[m[1]] = val
  }
}

async function connect() {
  loadEnv()
  const uri = process.env.MONGODB_URI
  if (!uri) throw new Error('MONGODB_URI missing')
  await mongoose.connect(uri, { dbName: 'swaseekh', bufferCommands: false })
  return mongoose
}

module.exports = { connect, mongoose }
