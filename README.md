### Tshmieldev's Amazing Code Runner
This is a backend service for running and testing code in a sandboxed environment.

Prerequisites:
- bun -> see `https://bun.com/docs/installation`
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
or
bun start
```

### How to use it?
- Check out the `tests` directory for examples.
- You will find usercode and unittests in `tests/data`
- You will see the API usage in the `.test.ts` files.

### Contributing
- Just send a PR!
- Make sure to `bun test`!
