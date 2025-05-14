import { existsSync, unlinkSync, writeFileSync, readFileSync } from "node:fs";
import { join } from "node:path";

const LOCK_FILE = ".backup.lock";
let dryRun = false;

export function setDryRun(enabled) {
	dryRun = !!enabled;
}

export function getLockFile() {
	return join(process.env.HOME, LOCK_FILE);
}

export function isLocked(unlock_after) {
	const lockfile = getLockFile();
	if (!existsSync(lockfile)) {
		return false;
	}
	const lastrun = readFileSync(lockfile, "utf-8");
	if (lastrun) {
		try {
			if (new Date().getTime() - Number.parseInt(lastrun) < unlock_after) {
				console.log(
					"Backup already in progress.",
					new Date(Number.parseInt(lastrun)).toISOString(),
				);
			}
		} catch (e) {
			console.log("Backup lock file is invalid.", lastrun);
			console.error(e);
		}
	}

	return true;
}
export function createLock() {
	if (!dryRun) {
		writeFileSync(getLockFile(), new Date().getTime().toString());
	} else {
		console.log("Dry run mode, nothing will be changed");
	}
}

export function cleanupLock() {
	const lockfile = getLockFile();
	if (!dryRun) {
		if (existsSync(lockfile)) {
			unlinkSync(lockfile);
		}
	}
}
