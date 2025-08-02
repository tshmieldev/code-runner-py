export const CONFIG = {
  CODE_DIR: './executor',
  SERVER_PORT: 3001,
  DOCKER: {
    IMAGE: 'python:3.10-slim',
    TIMEOUT: '5s',
    MEMORY: '256m',
    CPUS: '0.5',
    TMP_SIZE: '100m'
  }
} as const 