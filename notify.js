import {command} from "./command.js";

// export so that the notifications could be sent
// @see https://askubuntu.com/questions/978382/how-can-i-show-notify-send-messages-triggered-by-crontab
export async function notify(message) {
	const configureCmd = `export $(xargs -0 -a "/proc/$(/usr/bin/pgrep -n -U $UID gnome-session)/environ") 2>/dev/null;`;
	const notifyCmd = `/usr/bin/notify-send "backup" "${message}" --app-name=backup;`;
	await command(`${configureCmd}${notifyCmd}`, false);
	console.log(message);
}
