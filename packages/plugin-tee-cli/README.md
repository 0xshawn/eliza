
# TEE CLI


## Usage

1. Query teepods

```bash
pnpm cli teepods
```

2. Query images of the selected teepod

```bash
pnpm cli images --teepod-id 2
```


3. Deploy the CVM via compose file

```bash
pnpm cli deploy \
  -n <YOUR_APP_NAME> \
  -c <YOUR_COMPOSE_FILE> \
  --env-file <YOUR_ENV_FILE>
```

4. Upgrade the CVM

```bash
pnpm cli upgrade \
  --app-id <YOUR_APP_ID> \
  -c <YOUR_COMPOSE_FILE> \
  --env-file <YOUR_ENV_FILE>
```
