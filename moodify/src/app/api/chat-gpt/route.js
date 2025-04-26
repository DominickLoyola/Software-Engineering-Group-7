import { NextResponse } from "next/server";
import OpenAI from "openai";

const VALID_MOODS = new Set(['happy', 'sad', 'angry', 'neutral', 'fear']);

export async function POST(request) {
    console.log(process.env.OPENAI_API_KEY);

    const { input } = await request.json();
    
    // If input is already a valid mood, return it directly
    const normalizedInput = input.toLowerCase().trim();
    if (VALID_MOODS.has(normalizedInput)) {
        return NextResponse.json({
            choices: [
                {
                    message: {
                        content: normalizedInput
                    }
                }
            ]
        });
    }

    const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
    });

    const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
            {
                role: "system",
                content: "You are a mood classifier. Your job is to respond with ONLY ONE WORD from the following set: happy, sad, angry, neutral, fear. No explanation or extra words."
            },
            {
                role: "user",
                content: input,
            }
        ],
        temperature: 0,
        max_tokens: 1024,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
    });

    return NextResponse.json(response);
}