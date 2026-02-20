import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Convert file to base64
    const buffer = await file.arrayBuffer();
    const base64Data = Buffer.from(buffer).toString('base64');
    const mimeType = file.type;
    const dataUrl = `data:${mimeType};base64,${base64Data}`;

    // Call OpenAI Vision API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `You are a medical expert specialized in interpreting doctors' handwriting and medical documents. Analyze this document and provide the information in plain text format without any special characters, markdown, or formatting symbols. Simply use line breaks and basic punctuation.

Please analyze and extract:

1. Patient Information (if present)
2. Vital Signs/Measurements
3. Diagnoses (primary and secondary)
4. Prescribed Medications with dosages
5. Treatment Plans
6. Lab Results
7. Follow-up Instructions
8. Any warnings or special instructions

For unclear handwriting:
- Use medical context for interpretation
- Mark uncertainties with [?]
- Consider medical abbreviations
- Cross-reference with standard terminology

Format your response as simple text with clear sections. Do not use any special formatting characters, just use line breaks and basic punctuation.`
              },
              {
                type: "image_url",
                image_url: {
                  url: dataUrl
                }
              }
            ]
          }
        ],
        max_tokens: 4096,
        temperature: 0.2, // Lower temperature for more consistent medical analysis
        store: true // Required for gpt-4o-mini
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to analyze document');
    }

    const result = await response.json();
    const analyzedText = result.choices[0].message.content;

    return NextResponse.json({ 
      text: analyzedText.trim(),
      metadata: {
        fileType: file.type,
        fileName: file.name,
        processedAt: new Date().toISOString(),
        processingMethod: 'AI Vision Analysis'
      }
    });
  } catch (error) {
    console.error('Error processing file:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Error processing file',
      details: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
} 