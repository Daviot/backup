import { exec } from "node:child_process";
import { dim } from "./log.js";

export async function command(command, dryRun = false) {
	if (dryRun) {
		dim("$", command);
	} else {
		const result = await exec(command);
		const waiter = new Promise((resolve) => {
			result.stdout.on("end", resolve);
		});
		result.stdout.on("data", (data) => {
			console.log(data);
		});
		await waiter;
	}
}
