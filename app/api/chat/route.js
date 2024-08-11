import { NextResponse } from "next/server";
import OpenAI from "openai";

const systemPrompt = "You are an AI assistant at Interviewee whose job is to facilitate people with interview tips regarding big tech companies.";

export async function POST(req) {
    const openai = new OpenAI();
    const { messages } = await req.json();
    // console.log(messages)
    if (!Array.isArray(messages)) {
        return new NextResponse('Invalid data format', { status: 400 });
    }

    const completion = await openai.chat.completions.create({
        messages: [
            {
                role: 'system',
                content: systemPrompt
            },
            ...messages
        ],
        model: 'gpt-4o-mini',
        stream: true
    });

    const stream = new ReadableStream({
        async start(controller) {
            const encoder = new TextEncoder();
            try {
                for await (const chunk of completion) {
                    const content = chunk.choices[0]?.delta?.content;
                    if (content) {
                        const text = encoder.encode(content);
                        controller.enqueue(text);
                    }
                }
            } catch (err) {
                controller.error(err);
            } finally {
                controller.close();
            }
        }
    });

    return new NextResponse(stream);
}
