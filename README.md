# Backup Script

This Node.js script is used to backup my system.

> Prefered runtime is Bun, because of the faster startup time. but is also compatible with Node.js V8 runtime.

## Usage

```bash
bun ./backup.js
```

It requires a config file in your home directory called `backup.cnf.js`, an example file can be shown with `bun ./backup.js --init`.
