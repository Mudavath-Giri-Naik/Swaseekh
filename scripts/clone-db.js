#!/usr/bin/env node

/*
 * Clone or export the MongoDB database used by the app.
 *
 * Examples:
 *   node scripts/clone-db.js
 *   node scripts/clone-db.js --target=swaseekh_clone
 *   node scripts/clone-db.js --target=swaseekh_clone --overwrite
 *   node scripts/clone-db.js --json
 *   node scripts/clone-db.js --json --out=backups/db-clone
 */

const fs = require('fs')
const path = require('path')
const mongoose = require('mongoose')

const DEFAULT_SOURCE_DB = 'swaseekh'
const BATCH_SIZE = 1000

function parseArgs(argv) {
  const args = {
    source: DEFAULT_SOURCE_DB,
    target: null,
    overwrite: false,
    json: false,
    out: null,
  }

  for (const arg of argv) {
    if (arg === '--overwrite') args.overwrite = true
    else if (arg === '--json') args.json = true
    else if (arg.startsWith('--source=')) args.source = arg.slice('--source='.length)
    else if (arg.startsWith('--target=')) args.target = arg.slice('--target='.length)
    else if (arg.startsWith('--out=')) args.out = arg.slice('--out='.length)
    else if (arg === '--help' || arg === '-h') {
      printHelp()
      process.exit(0)
    } else {
      throw new Error(`Unknown argument: ${arg}`)
    }
  }

  return args
}

function printHelp() {
  console.log(`Usage:
  node scripts/clone-db.js [--target=name] [--overwrite]
  node scripts/clone-db.js --json [--out=directory]

Options:
  --source=name      Source DB name. Defaults to "swaseekh".
  --target=name      Target DB name for remote DB clone.
  --overwrite        Drop target DB before cloning. Refused unless explicit.
  --json             Export each collection to local JSON instead of remote clone.
  --out=directory    JSON export directory. Defaults to backups/<source>-<timestamp>.
`)
}

function timestamp() {
  return new Date()
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}Z$/, 'Z')
}

function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env.local')
  const raw = fs.readFileSync(envPath, 'utf8')
  for (const line of raw.split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
    if (!match) continue

    let value = match[2].trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }

    if (!process.env[match[1]]) process.env[match[1]] = value
  }
}

async function listCollections(db) {
  return db
    .listCollections({}, { nameOnly: false })
    .toArray()
    .then((collections) =>
      collections.filter((collection) => !collection.name.startsWith('system.'))
    )
}

async function createTargetCollection(sourceDb, targetDb, collectionInfo) {
  const name = collectionInfo.name
  const targetCollections = await targetDb
    .listCollections({ name }, { nameOnly: true })
    .toArray()

  if (targetCollections.length === 0) {
    const options = { ...(collectionInfo.options ?? {}) }
    delete options.uuid
    await targetDb.createCollection(name, options)
  }

  const indexes = await sourceDb.collection(name).indexes()
  const indexSpecs = indexes
    .filter((index) => index.name !== '_id_')
    .map((index) => {
      const { v, ns, ...spec } = index
      return spec
    })

  if (indexSpecs.length > 0) {
    await targetDb.collection(name).createIndexes(indexSpecs)
  }
}

async function copyCollection(sourceDb, targetDb, collectionInfo) {
  const name = collectionInfo.name
  const source = sourceDb.collection(name)
  const target = targetDb.collection(name)
  const total = await source.countDocuments()

  await createTargetCollection(sourceDb, targetDb, collectionInfo)

  if (total === 0) {
    console.log(`- ${name}: 0 documents`)
    return
  }

  const cursor = source.find({}, { noCursorTimeout: true }).batchSize(BATCH_SIZE)
  let batch = []
  let copied = 0

  try {
    for await (const doc of cursor) {
      batch.push(doc)
      if (batch.length >= BATCH_SIZE) {
        await target.insertMany(batch, { ordered: false })
        copied += batch.length
        batch = []
      }
    }

    if (batch.length > 0) {
      await target.insertMany(batch, { ordered: false })
      copied += batch.length
    }
  } finally {
    await cursor.close()
  }

  console.log(`- ${name}: ${copied}/${total} documents`)
}

async function cloneDatabase(args, client) {
  const sourceDb = client.db(args.source)
  const targetName = args.target || `${args.source}_clone_${timestamp()}`
  const targetDb = client.db(targetName)

  if (targetName === args.source) {
    throw new Error('Target DB must be different from source DB')
  }

  const existingTargetCollections = await listCollections(targetDb)
  if (existingTargetCollections.length > 0) {
    if (!args.overwrite) {
      throw new Error(
        `Target DB "${targetName}" is not empty. Re-run with --overwrite to replace it.`
      )
    }
    console.log(`Dropping existing target DB "${targetName}"...`)
    await targetDb.dropDatabase()
  }

  const collections = await listCollections(sourceDb)
  console.log(`Cloning "${args.source}" -> "${targetName}"`)
  console.log(`Collections: ${collections.length}`)

  for (const collectionInfo of collections) {
    await copyCollection(sourceDb, targetDb, collectionInfo)
  }

  console.log(`Done. Cloned database: ${targetName}`)
}

async function exportJson(args, client) {
  const sourceDb = client.db(args.source)
  const outDir = path.resolve(
    process.cwd(),
    args.out || path.join('backups', `${args.source}-${timestamp()}`)
  )

  fs.mkdirSync(outDir, { recursive: true })

  const collections = await listCollections(sourceDb)
  const manifest = {
    sourceDb: args.source,
    exportedAt: new Date().toISOString(),
    collections: [],
  }

  console.log(`Exporting "${args.source}" to ${outDir}`)
  console.log(`Collections: ${collections.length}`)

  for (const collectionInfo of collections) {
    const name = collectionInfo.name
    const docs = await sourceDb.collection(name).find({}).toArray()
    const indexes = await sourceDb.collection(name).indexes()
    const fileName = `${name}.json`
    const metaName = `${name}.indexes.json`

    fs.writeFileSync(path.join(outDir, fileName), JSON.stringify(docs, null, 2))
    fs.writeFileSync(path.join(outDir, metaName), JSON.stringify(indexes, null, 2))

    manifest.collections.push({
      name,
      count: docs.length,
      file: fileName,
      indexes: metaName,
    })
    console.log(`- ${name}: ${docs.length} documents`)
  }

  fs.writeFileSync(
    path.join(outDir, 'manifest.json'),
    JSON.stringify(manifest, null, 2)
  )

  console.log(`Done. JSON clone exported to: ${outDir}`)
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  loadEnv()

  const uri = process.env.MONGODB_URI
  if (!uri) throw new Error('MONGODB_URI missing in .env.local')

  await mongoose.connect(uri, {
    dbName: args.source,
    bufferCommands: false,
  })

  try {
    const client = mongoose.connection.getClient()
    if (args.json) await exportJson(args, client)
    else await cloneDatabase(args, client)
  } finally {
    await mongoose.disconnect()
  }
}

main().catch((error) => {
  console.error(error.message)
  process.exit(1)
})
