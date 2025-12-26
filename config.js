import { existsSync } from "node:fs";
import { warning } from "./log";

export async function readConfig(filePath) {
	if (!existsSync(filePath)) {
		warning(`Configuration file ${filePath} does not exist.`);
		return undefined;
	}
	const config = await import(filePath);
	if (!config?.default) {
		warning(`Configuration file ${filePath} does not export default.`);
		return undefined;
	}
	return config?.default;
}
