// Start by making sure the `assemblyai` package is installed.
// If not, you can install it by running the following command:
// npm install assemblyai

import { AssemblyAI } from "npm:assemblyai";

const {
	env
} = Deno;

const client = new AssemblyAI({
	apiKey: env.get("ASSEMBLY_AI_API_KEY")
});

const FILE_URL = env.get("AUDIO_FILE_PATH");

// Request parameters
const data = {
	audio: FILE_URL,
	language_code: "de",
	speaker_labels: true,
	speakers_expected: 2
};

const transcript = await client.transcripts.transcribe(data);

console.log(transcript.text);
