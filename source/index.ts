interface Env {
	WEBHOOK_URL: string;
	USER_ID: string;
}

const enum Time {
	Morning,
	Evening,
}

interface FactResponse {
	text: string;
}

async function sendFact(time: Time, { WEBHOOK_URL, USER_ID }: Env) {
	const body = (await (await fetch("https://uselessfacts.jsph.pl/random.json?language=en")).json()) as FactResponse;
	const { text: response } = body;

	await fetch(WEBHOOK_URL, {
		headers: { "Content-Type": "application/json" },
		method: "POST",
		body: JSON.stringify({
			allowed_mentions: { parse: ["users"] },
			content: `${time === Time.Morning ? "Wakey wakey" : "Take this to bed"}, <@${USER_ID}>!\n>>> ${response}`,
		}),
	});
}

export default {
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
