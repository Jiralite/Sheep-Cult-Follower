import process from "node:process";
import { setInterval } from "node:timers";
import { API } from "@discordjs/core";
import { REST } from "@discordjs/rest";

const { CHANNEL_ID, DISCORD_TOKEN, USER_ID } = process.env;
if (!CHANNEL_ID || !DISCORD_TOKEN || !USER_ID) throw new Error("Missing credentials.");
const rest = new REST().setToken(DISCORD_TOKEN);
const api = new API(rest);

setInterval(async () => {
	const date = new Date();
	const hours = date.getUTCHours();
	const minutes = date.getUTCMinutes();
	const seconds = date.getUTCSeconds();

	if (hours === 20 && minutes === 0 && seconds === 0) {
		await api.channels.createMessage(CHANNEL_ID, { content: `Good night, <@${USER_ID}>!` });
	}

	if (hours === 6 && minutes === 0 && seconds === 0) {
		await api.channels.createMessage(CHANNEL_ID, { content: `Good morning, <@${USER_ID}>!` });
	}
}, 1_000);
