import { readFile, writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'

const DATA_DIR = path.resolve(process.cwd(), '.profile-data')
const DATA_FILE = path.join(DATA_DIR, 'users.json')

/**
 * Reads the UserStore snapshot from a local JSON file.
 * Returns null if the file doesn't exist yet.
 */
export async function readSnapshotFromFile<T>(): Promise<T | null> {
  try {
    if (!existsSync(DATA_FILE)) {
      return null
    }
    const raw = await readFile(DATA_FILE, 'utf-8')
    return JSON.parse(raw) as T
  } catch (error) {
    console.error('[FilePersistence] Failed to read snapshot:', error)
    return null
  }
}

/**
 * Writes the UserStore snapshot to a local JSON file.
 * Ensures the data directory exists before writing.
 */
export async function writeSnapshotToFile<T>(snapshot: T): Promise<boolean> {
  try {
    if (!existsSync(DATA_DIR)) {
      await mkdir(DATA_DIR, { recursive: true })
    }
    await writeFile(DATA_FILE, JSON.stringify(snapshot, null, 2), 'utf-8')
    return true
  } catch (error) {
    console.error('[FilePersistence] Failed to write snapshot:', error)
    return false
  }
}

/**
 * Checks if file persistence is available/configured.
 * Always returns true in development; will always work.
 */
export function isFilePersistenceAvailable(): boolean {
  return true
}

/**
 * Gets the path to the data file (useful for debugging).
 */
export function getDataFilePath(): string {
  return DATA_FILE
}
