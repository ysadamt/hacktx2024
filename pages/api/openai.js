// pages/api/openai.js
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// API route to handle requests
export default async function handler(req, res) { 
    if (req.method === 'POST') {
        console.log("here", req.body)

        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo", // Use your preferred model
            messages: [{ role: "user", content: req.body.ask }], // Pass the prompt content
            max_tokens: 100,
        });

        console.log(completion.choices[0])

        // res.status(200).json({ result: completion.data.choices[0].message.content });
       
    } else {
        res.status(405).end(); // Method Not Allowed
    }
}
