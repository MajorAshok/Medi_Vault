import { GoogleGenAI } from '@google/genai'
import { NextResponse } from 'next/server'

export async function GET() {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

  const response = await ai.models.generateContent({
    model: 'gemini-flash-latest',
    contents: 'Say hello and confirm you are working correctly, in one short sentence.',
  })

  return NextResponse.json({ result: response.text })
}