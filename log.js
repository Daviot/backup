
const DIM = "\x1b[2m";
const RESET = "\x1b[0m";
const YELLOW = "\x1b[33m";

function isColorEnabled() {
	if (!process?.stdout?.isTTY) {
		return false;
	}
	if ("NO_COLOR" in process.env) {
		return false;
	}
	return true;
}

export function dim(...args) {
    if (!isColorEnabled()) {
		console.log(...args);
		return;
	}
    process.stdout.write(DIM);
	console.log(...args);
	process.stdout.write(RESET);
}

export function warning(...args) {
    if (!isColorEnabled()) {
		console.log(...args);
		return;
	}
    process.stdout.write(YELLOW);
	console.log(...args);
	process.stdout.write(RESET);
}
