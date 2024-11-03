// pages/api/openai.js
import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) { 
    if (req.method === 'POST') {
        //console.log('running');
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini", // model
            messages: [{ role: "user", content: // prompt + user input
                "Generate 25 songs that match the vibe/characteristic of the following words. When returning these songs, you should return the song name and who's it's by and parse it so every song/artist is in a tuple and the entire thing is in a list. Do not label each row with a number. You are only suppose to take phrases or single words and you should state \"Please enter reasonable characteristics/action verbs\" when prompted with absurb or inappropriate words. The keywords you will build the songs off of are: " + req.body.ask }],
        });
        const llmOutput = completion.choices[0].message.content;
        const cleanedString = llmOutput.replace(/[\[\]\n\s]/g, '').trim();
        const tuples = cleanedString.split('),');
        const result = tuples.map(pair => { const [song, artist] = pair.replace(/[()"]/g, '').split(',');
          return [song.trim(), artist.trim()];
        });
        //console.log(result);
        return result; // returns arr of tuples where tuple[0] = song, tuple[1] = artist
    } else {
        res.status(405).end(); // error handling
    }
}
