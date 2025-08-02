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
