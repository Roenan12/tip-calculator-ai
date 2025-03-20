import { NextResponse } from "next/server";

// Type checking for environment variables
const requiredEnvVars = {
  CLOUDFLARE_ACCOUNT_ID: process.env.CLOUDFLARE_ACCOUNT_ID,
  CLOUDFLARE_API_TOKEN: process.env.CLOUDFLARE_API_TOKEN,
} as const;

// Validate environment variables
Object.entries(requiredEnvVars).forEach(([key, value]) => {
  if (!value) throw new Error(`Missing environment variable: ${key}`);
});

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const {
      billAmount,
      serviceType,
      country,
      serviceQuality,
      foodQuality,
      experience,
    } = data;

    // Construct a detailed prompt for the AI
    const prompt = `As an AI tip calculator, analyze the following dining experience and recommend a tip percentage.

Context:
- Country: ${country}
- Service Type: ${serviceType}
- Bill Amount: $${billAmount}
- Service Quality (1-5): ${serviceQuality}
- Food Quality (1-5): ${foodQuality}
- Customer Experience: "${experience}"

Consider the following:
1. The base tipping rate in ${country}
2. The quality ratings provided
3. The customer's detailed experience
4. The type of service provided
5. The bill amount

Provide a specific tip percentage recommendation and explain why. Format your response exactly like this example:
{
  "recommendedTipPercentage": 18,
  "explanation": "Based on the excellent service...",
  "confidence": 0.85
}`;

    // Call Cloudflare Workers AI API
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${requiredEnvVars.CLOUDFLARE_ACCOUNT_ID}/ai/run/@cf/meta/llama-3.1-8b-instruct`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${requiredEnvVars.CLOUDFLARE_API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      }
    );

    const result = await response.json();

    // Parse the AI response to extract the JSON object
    try {
      const aiResponse = JSON.parse(result.result.response);
      return NextResponse.json(aiResponse);
    } catch {
      // If parsing fails, provide a fallback response
      return NextResponse.json({
        recommendedTipPercentage: 15,
        explanation:
          "Failed to parse AI response. Using default recommendation.",
        confidence: 0.5,
      });
    }
  } catch (err) {
    console.error("Error in tip recommendation:", err);
    return NextResponse.json(
      { error: "Failed to get tip recommendation" },
      { status: 500 }
    );
  }
}
