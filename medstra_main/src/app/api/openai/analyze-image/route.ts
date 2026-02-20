import OpenAI from 'openai';
import { NextResponse } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  const { image } = await req.json();

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "The user uploaded an image. Please provide a detailed description of the image in third person."
        },
        {
          role: "user",
          content: [
            { type: "text", text: "Please analyze this medical image in detail and suggest a relevant question to ask about it." },
            {
              type: "image_url",
              image_url: {
                "url": image,
                "detail": "high"
              }
            }
          ]
        }
      ],
      max_tokens: 500,
    });

    const analysis = response.choices[0].message.content;

    return NextResponse.json({ analysis });
  } catch (error) {
    console.error('Error analyzing image:', error);
    return NextResponse.json({ error: 'Failed to analyze image' }, { status: 500 });
  }
} 