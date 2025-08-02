import { Hono } from 'hono'
import { serve } from 'bun'
import { CONFIG } from './config'
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
  const body = await c.req.json()
  const validatedData = requestSchema.safeParse(body)

  if (!validatedData.success) {
    return c.json({ error: validatedData.error.message }, 400)
  }

  const { usercode, unittests, performancetests, api_key } = validatedData.data

  if(api_key !== Bun.env.API_KEY) {
    return c.json({ error: 'Invalid API key' }, 401)
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
    const command = buildDockerCommand(sessionId, sessionPath)
    const proc = Bun.spawn(command, {
      stdout: 'pipe',
      stderr: 'pipe'
    })

    const stdout = await new Response(proc.stdout).text()
    const stderr = await new Response(proc.stderr).text()

    // Cleanup
    untrackContainer(containerName)
    await cleanupSessionDirectory(sessionPath, sessionId)

    // Parse and return results
    const data = stdout
    return c.json({ data: JSON.parse(data) })
    
  } catch (err) {
    // Error cleanup
    untrackContainer(containerName)
    await cleanupContainer(containerName)
    await cleanupSessionDirectory(sessionPath, sessionId)
    
    return c.json({ 
      error: err instanceof Error ? err.message : String(err) 
    }, 500)
  }
})

// Start server
serve({
  fetch: app.fetch,
  port: CONFIG.SERVER_PORT,
})

console.log(`🚀 Runner running on http://localhost:${CONFIG.SERVER_PORT}`)
