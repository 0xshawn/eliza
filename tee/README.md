
# TEE CLI


## Build

```bash
pnpm --filter tee build
```

## Usage

1. Query teepods

```bash
npx tee-cli teepods
```

2. Query images of the selected teepod

```bash
npx tee-cli images --teepod-id 2
```


3. Deploy the CVM via compose file

```bash
npx tee-cli deploy -t phala -m docker-compose -n eliza -s "my-secret" -c ./docker-compose.yml
```

## Debug

If you want to debug the CLI, you can run the following command without building:

```bash
pnpm exec ts-node src/cli.ts teepods
```
