import OpenAI from "openai";

interface Env {
	WEBHOOK_URL: string;
	OPENAI_API_KEY: string;
	USER_ID: string;
}

const enum Time {
	Morning,
	Evening,
}

const AI_FACTS = ["Lie about something to me.", "Tell me something completely random or made up."] as const;
const AI_FACTS_LENGTH = AI_FACTS.length;

async function sendFact(time: Time, { WEBHOOK_URL, OPENAI_API_KEY, USER_ID }: Env) {
	const openAI = new OpenAI({ apiKey: OPENAI_API_KEY });

	const completion = await openAI.chat.completions.create({
		messages: [
			{ role: "user", content: `${AI_FACTS[Math.floor(Math.random() * AI_FACTS_LENGTH)]} Keep your response short.` },
		],
		model: "gpt-4-1106-preview",
	});

	const response = completion.choices[0]!.message.content;

	const content = response
		? `${time === Time.Morning ? "Wakey wakey" : "Take this to bed"}, <@${USER_ID}>!\n>>> ${response}`
		: `Good day, <@${USER_ID}>!`;

	await fetch(WEBHOOK_URL, {
		headers: { "Content-Type": "application/json" },
		method: "POST",
		body: JSON.stringify({ allowed_mentions: { parse: [] }, content }),
	});
}

export default {
	async fetch() {
		return new Response("", { status: 444, statusText: "The sheep was not interested in your HTTP request." });
	},
	async scheduled(_, env) {
		let time;

		switch (new Date().getUTCHours()) {
			case 7:
				time = Time.Morning;
				break;
			case 22:
				time = Time.Evening;
				break;
			default:
				return;
		}

		try {
			await sendFact(time, env);
		} catch (error) {
			console.error(error);
		}
	},
} satisfies ExportedHandler<Env>;
