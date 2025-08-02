Prerequisites:
- bun -> `https://bun.com/`
- docker -> see `https://docs.docker.com/engine/install/`
- docker image - python:3.10-slim -> `docker pull python:3.10-slim`
- make sure the user running the code has docker permissions -> `sudo usermod -aG docker $USER`, then reload terminal or `newgrp docker`

To install dependencies:
```sh
bun install
```

To run:
```sh
bun run dev
```

```
To use:
POST http://localhost:3001
body:
  usercode: z.string().min(1),
  unittests: z.string().min(1),
  performancetests: z.string(),
  api_key: z.string().min(1),
  config (optionally): {
    timeout: z.number().min(1).max(300).int().optional(), // seconds
    memory: z.number().min(64).max(2048).int().optional(), // mB
    cpus: z.number().min(0.5).max(4.0).multipleOf(0.5).optional(), // increments of 0.5
    tmp_size: z.number().min(10).max(1024).int().optional(), // mB
  }

Defaults are in /src/config.ts
```
