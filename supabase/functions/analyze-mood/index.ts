import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { moodText } = await req.json();

    if (!moodText || typeof moodText !== "string") {
      return new Response(
        JSON.stringify({ error: "Mood text is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "Service configuration error. Please try again later." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const systemPrompt = `You are a compassionate mental health support AI assistant for MindHaven. Your role is to:
1. Acknowledge and validate the user's feelings with empathy
2. Identify 2-3 key emotions present in the text
3. Provide 3 personalized, actionable coping strategies or tips
4. Offer encouragement and hope

Guidelines:
- Be warm, understanding, and non-judgmental
- Keep the main insight concise but meaningful (around 100-150 words)
- Focus on evidence-based techniques like mindfulness, breathing exercises, cognitive reframing
- If the user expresses severe distress or mentions self-harm, gently encourage seeking professional help
- Use a supportive closing sentence

Also, analyze the mood and provide a score from 1-10 where:
1-3 = distressed/low
4-5 = struggling/anxious
6-7 = neutral/okay
8-10 = positive/thriving

Format your response as a valid JSON object with EXACTLY these keys:
{
  "insight": "Your empathetic analysis and validation (string)",
  "moodScore": <number 1-10>,
  "emotions": ["emotion1", "emotion2"],
  "tips": ["Tip 1", "Tip 2", "Tip 3"],
  "closing": "One-sentence uplifting closing (string)"
}`;

    // Add timeout handling for AI gateway request (30 seconds)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    let response;
    try {
      response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: `Here's how I'm feeling: ${moodText}` },
          ],
          temperature: 0.7,
        }),
        signal: controller.signal,
      });
    } catch (fetchError) {
      clearTimeout(timeoutId);
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        console.error("AI gateway request timed out");
        return new Response(
          JSON.stringify({ error: "Request timed out. Please try again." }),
          { status: 504, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw fetchError;
    }
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Service temporarily unavailable. Please try again later." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      return new Response(
        JSON.stringify({ error: "Failed to analyze mood. Please try again." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      console.error("No content in AI response:", JSON.stringify(data));
      return new Response(
        JSON.stringify({ error: "No response from AI. Please try again." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse the JSON response from the AI
    let parsedResponse;
    try {
      // Extract JSON from the response (handle markdown code blocks)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedResponse = JSON.parse(jsonMatch[0]);
      } else {
        console.error("No JSON found in AI response:", content);
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError, "Content:", content);
      // Fallback with proper structure
      parsedResponse = {
        insight: content,
        moodScore: 5,
        emotions: ["thoughtful"],
        tips: ["Take a deep breath", "Practice mindfulness", "Reach out to a friend"],
        closing: "We're here for you."
      };
    }

    // Validate the parsed response has all required fields
    const finalResponse = {
      insight: parsedResponse.insight || parsedResponse.response || content,
      moodScore: typeof parsedResponse.moodScore === 'number' ? parsedResponse.moodScore : 5,
      emotions: Array.isArray(parsedResponse.emotions) ? parsedResponse.emotions : ["thoughtful"],
      tips: Array.isArray(parsedResponse.tips) && parsedResponse.tips.length > 0 
        ? parsedResponse.tips 
        : ["Take a deep breath", "Practice mindfulness", "Reach out to a friend"],
      closing: parsedResponse.closing || "We're here for you."
    };

    // Final validation - ensure insight exists
    if (!finalResponse.insight || typeof finalResponse.insight !== 'string') {
      console.error("Incomplete AI response - missing insight:", parsedResponse);
      return new Response(
        JSON.stringify({ error: "AI returned incomplete response. Please try again." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify(finalResponse),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in analyze-mood:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "An error occurred. Please try again." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
