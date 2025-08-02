import { Config } from "./validation"

export const DEFAULT_CONFIG = {
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

export const DOCKER_CONFIG = (config?: Config) => {
    return {
        TIMEOUT: (config?.timeout?.toString()) ? (config?.timeout?.toString() + 's') : (DEFAULT_CONFIG.DOCKER.TIMEOUT),
        MEMORY: (config?.memory?.toString()) ? (config?.memory?.toString() + 'm') : (DEFAULT_CONFIG.DOCKER.MEMORY),
        CPUS: (config?.cpus?.toString()) ? (config?.cpus?.toString()) : (DEFAULT_CONFIG.DOCKER.CPUS),
        TMP_SIZE: (config?.tmp_size?.toString()) ? (config?.tmp_size?.toString() + 'm') : (DEFAULT_CONFIG.DOCKER.TMP_SIZE)
    }
}