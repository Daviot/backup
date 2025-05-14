import { existsSync } from "node:fs";

export async function readConfig(filePath) {
	if (!existsSync(filePath)) {
		console.log(`Configuration file ${filePath} does not exist.`);
		return undefined;
	}
	const config = await import(filePath);
	if (!config?.default) {
		console.log(`Configuration file ${filePath} does not export default.`);
		return undefined;
	}
	return config?.default;
}
