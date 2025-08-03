import { Hono } from 'hono'
import { serve } from 'bun'
import { DEFAULT_CONFIG as CONFIG } from './config'
import { requestSchema } from './validation'
import { 
  buildDockerCommand, 
  getContainerName, 
  trackContainer, 
  untrackContainer, 
  cleanupContainer,
  setupContainerCleanup 
} from './docker'
import { 
  initializeCodeDir, 
  createSessionDirectory, 
  copyTemplateFiles, 
  cleanupSessionDirectory, 
  prepareCodeFiles
} from './files'

// Initialize
const app = new Hono()
initializeCodeDir()
setupContainerCleanup()

app.post('/run', async (c) => {
  // TODO: In the future, accept dynamic code via POST request
  let body = null;

  try{
    body = await c.req.json()
  }
  catch {
    return c.json({ success: false, error: 'Invalid JSON' }, 400)
  }
  
  const validatedData = requestSchema.safeParse(body)

  if (!validatedData.success) {
    return c.json({ success: false,error: validatedData.error.message }, 400)
  }

  const { usercode, unittests, performancetests, api_key, config } = validatedData.data

  if(api_key !== Bun.env.API_KEY) {
    return c.json({ success: false, error: 'Invalid API key' }, 401)
  }

  // Create unique session
  const sessionId = Date.now().toString()
  const sessionPath = await createSessionDirectory(sessionId)
  const containerName = getContainerName(sessionId)

  try {
    // Setup files and container
    // for debug -> await copyTemplateFiles(sessionPath)
    await prepareCodeFiles(sessionPath, usercode, unittests, performancetests)
    trackContainer(containerName)

    // Execute in Docker
    const command = buildDockerCommand(sessionId, sessionPath, config)
    const proc = Bun.spawn(command, {
      stdout: 'pipe',
      stderr: 'pipe'
    })

    const stdout = await new Response(proc.stdout).text()
    const stderr = await new Response(proc.stderr).text()
    
    // Wait for process to complete and get exit code
    const exitCode = await proc.exited

    // Check if container timed out
    if (exitCode === 124) {
      // Timeout exit code from the 'timeout' command
      untrackContainer(containerName)
      await cleanupSessionDirectory(sessionPath, sessionId)
      
      return c.json({ 
        success: false,
        error: 'Execution timed out',
        message: 'Code execution exceeded the time limit',
        exit_code: exitCode,
        stdout: stdout,
        stderr: stderr,
        timeout: true
      }, 408) // 408 Request Timeout
    }
    
    // Check for other Docker/execution errors
    if (exitCode !== 0) {
      untrackContainer(containerName)
      await cleanupSessionDirectory(sessionPath, sessionId)

      return c.json({ 
        success: false,
        error: 'Execution failed',
        message: `Process exited with code ${exitCode}`,
        exit_code: exitCode,
        stdout: stdout,
        stderr: stderr,
        timeout: false
      }, 500)
    }

    // Cleanup on success
    untrackContainer(containerName)
    await cleanupSessionDirectory(sessionPath, sessionId)

    // Parse and return results
    try {
      const data = JSON.parse(stdout)
      return c.json({ 
        success: true,
        data,
        exit_code: exitCode,
        timeout: false
      })
    } catch (parseError) {
      return c.json({ 
        success: false,
        error: 'Failed to parse execution results',
        message: 'The code executed but produced invalid output',
        stdout: stdout,
        stderr: stderr,
        exit_code: exitCode,
        timeout: false
      }, 500)
    }
    
  } catch (err) {
    // Error cleanup
    untrackContainer(containerName)
    await cleanupContainer(containerName)
    await cleanupSessionDirectory(sessionPath, sessionId)
    
    return c.json({ 
      error: err instanceof Error ? err.message : String(err),
      timeout: false
    }, 500)
  }
})

// Start server
serve({
  fetch: app.fetch,
  port: CONFIG.SERVER_PORT,
})

console.log(`🚀 Runner running on http://localhost:${CONFIG.SERVER_PORT}`)
