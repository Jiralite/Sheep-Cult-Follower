import process from "node:process";
import { setInterval } from "node:timers";
import { API } from "@discordjs/core";
import { REST } from "@discordjs/rest";
import OpenAI from "openai";

const { CHANNEL_ID, DISCORD_TOKEN, OPENAI_API_KEY, USER_ID } = process.env;
if (!CHANNEL_ID || !DISCORD_TOKEN || !OPENAI_API_KEY || !USER_ID) throw new Error("Missing credentials.");
const rest = new REST().setToken(DISCORD_TOKEN);

// @ts-expect-error Unknown type error.
const api = new API(rest);
const openAI = new OpenAI({ apiKey: OPENAI_API_KEY });
const AI_DEFAULT_RESPONSE = `Good day, <@${USER_ID}>!` as const;

const AI_FACTS = [
	"Lie about something to me.",
	"Tell me an interesting fact.",
	"Tell me something completely random or made up.",
] as const;

const AI_FACTS_LENGTH = AI_FACTS.length;

const enum Time {
	Morning,
	Evening,
}

async function sendFact(time: Time) {
	try {
		const completion = await openAI.chat.completions.create({
			messages: [
				{ role: "user", content: `${AI_FACTS[Math.floor(Math.random() * AI_FACTS_LENGTH)]} Keep your response short.` },
			],
			model: "gpt-4-1106-preview",
		});

		const response = completion.choices[0]!.message.content;

		const content = response
			? `${time === Time.Morning ? "Wakey wakey" : "Take this to bed"}, <@${USER_ID}>!\n>>> ${response}`
			: AI_DEFAULT_RESPONSE;

		await api.channels.createMessage(CHANNEL_ID!, { allowed_mentions: { parse: [] }, content });
	} catch (error) {
		console.log(error);
	}
}

setInterval(async () => {
	const date = new Date();
	const hours = date.getUTCHours();
	const minutes = date.getUTCMinutes();
	const seconds = date.getUTCSeconds();

	if (hours === 8 && minutes === 0 && seconds === 0) {
		await sendFact(Time.Morning);
	}

	if (hours === 22 && minutes === 30 && seconds === 0) {
		await sendFact(Time.Evening);
	}
}, 1_000);
