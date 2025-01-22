
# TEE CLI


## Build

```bash
pnpm --filter tee build
```

## Usage

```bash
npx tee-cli deploy -t phala -m docker-compose -n eliza -s "my-secret" -c ./docker-compose.yml

# or just run without build
# pnpm exec ts-node src/tee.ts
```
