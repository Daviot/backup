import {
	existsSync,
	mkdirSync,
	readdirSync,
	readFileSync,
	unlinkSync,
	writeFileSync,
} from "node:fs";
import { join } from "node:path";
import { readConfig } from "./config.js";
import { command } from "./command.js";
import { cleanupLock, createLock, isLocked, setDryRun } from "./lock.js";
import { notify } from "./notify.js";

const BKG_CONFIG_FILE = "backup.cnf.js";
const SNAPSHOT_FILE = ".backup.snapshot";

(async () => {
	// log errors
	process.on("uncaughtException", async (error) => {
		console.log(error);
	});
	process.on("unhandledRejection", async (reason) => {
		console.log(reason);
	});

	let dryRun = false;
	let init = false;
	for (const arg of process.argv) {
		switch (arg) {
			case "--dry-run":
				dryRun = true;
				break;
			case "--init":
				init = true;
				break;
		}
	}
	// read first argument
	const file = join(process.env.HOME, BKG_CONFIG_FILE);

	if (init) {
		console.log("Create the config file:", file);
		console.log("Example:");
		console.log(`export default {
	targets: ["/absolute/path/to/the/destination"],
	unlock_after: 60 * 60 * 1000 * 6, // 6 hours
	includes: [
		"~/.ssh",
		"~/.config"
	],
	exclude: [
		"node_modules",
		"~/.ssh/known_hosts",
	],
	create_snapshot: true,
	keep_snapshots: 3,
};
`);
		process.exit(0);
	}

	// read config
	const config = await readConfig(file);
	if (!config) {
		process.exit(1);
	}

	// check lock
	const start = new Date();
	setDryRun(dryRun);
	if (isLocked(config?.unlock_after ?? 60 * 60 * 1000)) {
		process.exit(0);
	}

	console.log("Backup started at", start.toLocaleString());

	const target = config?.targets?.find((target) => existsSync(target));
	if (!target) {
		await notify("No target found.");
		process.exit(1);
	}
	// create lock file
	createLock();
	console.log("Using target", target);

	const targetPath = join(target, "current");
	const targetConfig = await readConfig(join(target, BKG_CONFIG_FILE));
	if (targetConfig) {
		for (const [key, value] of Object.entries(targetConfig)) {
			config[key] = value;
		}
	}

	// check snapshot creation
	let createSnapshot = config.create_snapshot;
	if (config.create_snapshot) {
		const snapshotFilePath = join(target, SNAPSHOT_FILE);
		if (existsSync(snapshotFilePath)) {
			const content = readFileSync(snapshotFilePath, "utf-8");
			if (content) {
				if (content === new Date().toDateString()) {
					createSnapshot = false;
				}
			}
		}
		if (createSnapshot && !dryRun) {
			writeFileSync(snapshotFilePath, new Date().toDateString());
		}
	}

	// modify the config includes and excludes
	config.includes = config?.includes?.map((include) =>
		include.replace(/~/g, process.env.HOME),
	);
	config.exclude = config?.exclude?.map((exclude) =>
		exclude.replace(/~/g, process.env.HOME),
	);

	if (dryRun) {
		console.log("Config", config);
	}

	for (const include of config.includes) {
		console.log("Backup", include);
		// copy the files to the current which is the root folder
		const entryTarget = join(targetPath, include, "..");
		const excludes = config?.exclude
			?.filter(
				(exclude) => !exclude.startsWith("/") || exclude.startsWith(include),
			)
			?.map((exclude) => `--exclude=${exclude}`);
		// build rsync command
		const rsyncCommand = `rsync -a --delete --delete-excluded ${excludes?.join(" ") ?? ""} ${include} ${entryTarget}`;

		await command(rsyncCommand, dryRun);
	}
	if (createSnapshot) {
		const snapshotPath = join(target, "snapshots");
		// create snapshot
		const date = new Date();
		const snapshotName = `${date.getFullYear()}${(date.getMonth() + 1)
			.toString()
			.padStart(2, "0")}${date.getDate().toString().padStart(2, "0")}.tar.gz`;
		const snapshotFullPath = join(snapshotPath, snapshotName);
		console.log("Create snapshot", snapshotFullPath);
		mkdirSync(snapshotPath, { recursive: true });
		const snapshotCommand = `tar -czf ${snapshotFullPath} ${targetPath}`;
		await command(snapshotCommand, dryRun);
		// remove old snapshots
		if (existsSync(snapshotPath)) {
			const files = readdirSync(snapshotPath);
			files.sort((a, b) => {
				return new Date(a).getTime() - new Date(b).getTime();
			});
			for (let i = 0; i < files.length - (config?.keep_snapshots ?? 3); i++) {
				if (dryRun) {
					console.log("Remove snapshot", files[i]);
				} else {
					unlinkSync(join(snapshotPath, files[i]));
				}
			}
		}
		await notify("Snapshot created");
	}
	cleanupLock();

	console.log(
		`Backup done in ${Math.round((new Date().getTime() - start.getTime()) / 1000)}s`,
	);
	// remove lock file on exit
	process.on("exit", () => {
		cleanupLock();
	});
})();
