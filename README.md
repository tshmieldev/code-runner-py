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
  api_key: z.string().min(1)
```
