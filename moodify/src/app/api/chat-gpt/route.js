import { NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(request) {

    console.log(process.env.OPENAI_API_KEY);

    const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
    })

    const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
            {
                role: "system",
                content: "just need one word response"
            },
            {
                role: "user",
                content: "im feeling down, categorize my mood in one of the following categories: happy, sad, angry, neutral, fearful"
            }
        ],
        temperature: 0,
        max_tokens: 1024,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
    })

    return NextResponse.json(response);
}