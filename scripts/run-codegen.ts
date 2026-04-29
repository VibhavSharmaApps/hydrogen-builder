import { generateProject } from '../src/codegen/index'
import type { BuildInput } from '../src/codegen/types'
import { readFileSync, mkdirSync, writeFileSync, rmSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const samplePath = join(__dirname, '../samples/fashion-homepage.json')
const outDir = join(__dirname, '../dist-sample')

let input: BuildInput
try {
  input = JSON.parse(readFileSync(samplePath, 'utf-8')) as BuildInput
} catch (err) {
  console.error('Failed to read sample JSON:', err)
  process.exit(1)
}

let files: Record<string, string>
try {
  files = generateProject(input)
} catch (err) {
  console.error('generateProject failed:', err)
  process.exit(1)
}

rmSync(outDir, { recursive: true, force: true })

for (const [filePath, content] of Object.entries(files)) {
  const fullPath = join(outDir, filePath)
  mkdirSync(dirname(fullPath), { recursive: true })
  writeFileSync(fullPath, content, 'utf-8')
}

const sorted = Object.keys(files).sort()
console.log(`\nGenerated ${sorted.length} files → dist-sample/`)
for (const f of sorted) console.log('  ' + f)
