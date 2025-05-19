import {command} from "./command.js";

let configured = false;
export async function notify(message) {
	if (!configured) {
		configured = true;
		// export so that the notifications could be sent
		// @see https://askubuntu.com/questions/978382/how-can-i-show-notify-send-messages-triggered-by-crontab
		await command(
			`export $(xargs -0 -a "/proc/$(pgrep gnome-session -n -U $UID)/environ") 2>/dev/null`,
			false,
		);
	}
	console.log(message);
	await command(`notify-send "backup" "${message}" --app-name=backup`, false);
}
