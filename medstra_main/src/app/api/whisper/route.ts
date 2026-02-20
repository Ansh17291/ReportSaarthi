import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('file') as Blob;

    if (!audioFile) {
      return NextResponse.json(
        { error: "No audio file provided" },
        { status: 400 }
      );
    }

    // Convert Blob to File
    const file = new File([audioFile], "audio.webm", {
      type: audioFile.type,
    });

    // Transcribe with Whisper
    const transcription = await openai.audio.translations.create({
      model: "whisper-1",
      file,
      response_format: "text",
    });

    return NextResponse.json({ text: transcription });
  } catch (error) {
    console.error("Error processing audio:", error);
    return NextResponse.json(
      { error: "Failed to process audio" },
      { status: 500 }
    );
  }
} 