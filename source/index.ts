interface Env {
	WEBHOOK_URL: string;
	OPENAI_API_KEY: string;
	USER_ID: string;
}

const enum Time {
	Morning,
	Evening,
}

type ChatCompletion = { choices: { message: { content: string } }[] };
const AI_FACTS = ["Lie about something to me.", "Tell me something completely random or made up."] as const;
const AI_FACTS_LENGTH = AI_FACTS.length;

async function sendFact(time: Time, { WEBHOOK_URL, OPENAI_API_KEY, USER_ID }: Env) {
	const completion = await fetch("https://api.openai.com/v1/chat/completions", {
		method: "POST",
		headers: {
			Authorization: `Bearer ${OPENAI_API_KEY}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			messages: [
				{ role: "user", content: `${AI_FACTS[Math.floor(Math.random() * AI_FACTS_LENGTH)]} Keep your response short.` },
			],
			model: "gpt-4-1106-preview",
		}),
	});

	const body = (await completion.json()) as ChatCompletion;
	const response = body.choices[0]!.message.content;

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
	async scheduled({ scheduledTime }, env) {
		const date = new Date(scheduledTime);
		let time;

		switch (date.getUTCHours()) {
			case 7:
				time = Time.Morning;
				break;
			case 22:
				time = Time.Evening;
				break;
			default:
				throw new Error(`Invalid scheduled time: ${date}`);
		}

		try {
			await sendFact(time, env);
		} catch (error) {
			console.error(error);
		}
	},
} satisfies ExportedHandler<Env>;
