import Groq from 'groq-sdk';
import 'dotenv/config';

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

const response = await groq.chat.completions.create({
    model: 'openai/gpt-oss-120b',
    messages: [
        {
            role: 'user',
            content: 'Reply with exactly: Groq connection successful',
        },
    ],
});

console.log(response.choices[0].message.content);