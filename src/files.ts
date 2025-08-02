import { join } from 'path'
import { existsSync, mkdirSync } from 'fs'
import { mkdir, copyFile, rm , writeFile} from 'fs/promises'
import { DEFAULT_CONFIG as CONFIG } from './config'

// Initialize executor directory
export function initializeCodeDir(): void {
  if (!existsSync(CONFIG.CODE_DIR)) {
    mkdirSync(CONFIG.CODE_DIR)
  }
}

export async function createSessionDirectory(sessionId: string): Promise<string> {
  const sessionPath = join(CONFIG.CODE_DIR, sessionId)
  await mkdir(sessionPath, { recursive: true })
  return sessionPath
}

export async function copyTemplateFiles(sessionPath: string): Promise<void> {
  const srcDir = __dirname
  
  await copyFile(join(srcDir, 'runner.py'), join(sessionPath, 'runner.py'))
  await copyFile(join(srcDir, '../mock/usercode.py'), join(sessionPath, 'usercode.py'))
  await copyFile(join(srcDir, '../mock/unittests.py'), join(sessionPath, 'unittests.py'))
  await copyFile(join(srcDir, '../mock/performance_tests.py'), join(sessionPath, 'performance_tests.py'))
}

export async function writeCodeFile(sessionPath: string, filename: string, content: string): Promise<void> {
  await writeFile(join(sessionPath, filename), content)
}

export async function prepareCodeFiles(sessionPath: string, usercode: string, unittests: string, performancetests: string): Promise<void> {
  const srcDir = __dirname
  await copyFile(join(srcDir, 'runner.py'), join(sessionPath, 'runner.py'))
  await copyFile(join(srcDir, '../mock/usercode.py'), join(sessionPath, 'usercode.py'))
  await copyFile(join(srcDir, '../mock/unittests.py'), join(sessionPath, 'unittests.py'))
  await copyFile(join(srcDir, '../mock/performance_tests.py'), join(sessionPath, 'performance_tests.py'))

  await writeCodeFile(sessionPath, 'usercode.py', usercode)
  await writeCodeFile(sessionPath, 'unittests.py', unittests)
  await writeCodeFile(sessionPath, 'performance_tests.py', performancetests)
}



export async function cleanupSessionDirectory(sessionPath: string, sessionId: string): Promise<void> {
  try {
    await rm(sessionPath, { recursive: true, force: true })
  } catch (cleanupErr) {
    console.warn(`Failed to cleanup session ${sessionId}:`, cleanupErr)
  }
} 