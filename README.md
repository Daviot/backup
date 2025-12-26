# Backup Script

This Node.js/Bun script is used to backup my system.

> Prefered runtime is Bun, because of the faster startup time. but is also compatible with Node.js V8 runtime.

There are no external libraries used, no need to install anything.

## Usage

```bash
bun .
```

It requires a config file in your home directory called `backup.cnf.js`.

## Getting started

```bash
bun . --init
```

## Options

- `--dry-run`: Do not backup, but show what would be done.
- `--init`: Initialize the config file.

## Configuration

### `targets`

Default: `[]`

List of targets to backup. The targets will be checked in order and the first existing target will be used.

> The target should be an absolute path.

### `unlock_after`

Default: `3600000` (1 hour)

Time in milliseconds after which the lock file is removed.

### `includes`

Default: `[]`

List of files and directories to backup.

> The target should be an absolute path.

### `exclude`

Default: `[]`

List of files to exclude.

> The target should be an absolute path. If the target is relative, it will be excluded from all includes.

### `create_snapshot`

Default: `true`

Create a snapshot of the backup daily.

### `keep_snapshots`

Default: `3`

Number of snapshots to keep.

## Target Configuration

It is possible to add a config file to the target directory called `backup.cnf.js`.

> The target config will override the global config.

Example:
```js
export default {
	create_snapshot: false
};
```
This can be a usefull configuration if the target doesn't have enough space to keep multiple snapshots.

## Cronjob

To run the backup daily, you can add a cronjob.

```bash
crontab -e

*/30 * * * * /usr/bin/node /path/to/backup/backup.js >> /path/to/backup/backup.log
```

This will run the backup every 30 minutes and log the output to a file.