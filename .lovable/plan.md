

# Fix: AI Mood Analyzer White Page Bug

## Problem Summary

When the AI gateway returns an error (rate limit, timeout, or malformed response), the Mood Analyzer page crashes and shows a blank white screen. Additionally, mood logs are being saved with null AI data, causing incomplete entries on the dashboard.

## Root Causes Identified

1. **Missing error field validation** - The frontend checks for `error` from `supabase.functions.invoke()`, but the edge function sometimes returns errors inside the `data` object with a 200 status
2. **No response completeness check** - The code proceeds to render even when required fields (`insight`, `moodScore`, `tips`) are missing
3. **Premature database save** - The mood log is saved before validating that the AI response is complete
4. **React crash on missing properties** - The UI tries to render `aiResponse.insight`, `aiResponse.tips.map()`, etc. without null checks

---

## Implementation Plan

### Step 1: Update MoodAnalyzer.tsx - Robust Error Handling

Modify the `handleAnalyze` function (around lines 201-267):

**Changes:**
- Check if `data` contains an `error` field (edge function error passed in response body)
- Validate that all required fields exist before proceeding
- Only save to database if response is complete
- Add specific error messages for rate limits vs general failures

```text
Current flow:
1. Call edge function
2. Check for error
3. Set AI response
4. Save to database

New flow:
1. Call edge function
2. Check for invoke error
3. Check for error field in data
4. Validate required fields (insight, moodScore, tips, emotions)
5. Set AI response
6. Save to database only if valid
```

### Step 2: Update Edge Function - Proper HTTP Status Codes

Modify `supabase/functions/analyze-mood/index.ts` to ensure ALL error paths return proper HTTP error status codes (not 200 with an error field):

**Changes:**
- Add request timeout handling (30 second timeout for AI gateway)
- Validate parsed AI response has all required fields
- Return 500 status for incomplete responses
- Add better error logging for debugging

### Step 3: Add Defensive Rendering in UI

Update the results display section (around line 428+) to add null checks:

**Changes:**
- Wrap all `aiResponse` property accesses with optional chaining
- Add fallback content for missing fields
- Ensure `tips.map()` and `emotions.map()` don't crash on undefined

### Step 4: Update config.toml

Add the edge function configuration with `verify_jwt = false` to ensure the function is properly configured.

---

## Technical Details

### File: src/pages/MoodAnalyzer.tsx

**handleAnalyze function changes:**

```typescript
try {
  const { data, error } = await supabase.functions.invoke("analyze-mood", {
    body: { moodText: moodText.trim() },
  });

  // Check for invoke-level error
  if (error) {
    throw error;
  }

  // Check for error returned in response body
  if (data?.error) {
    // Handle specific error types
    if (data.error.includes("Rate limit")) {
      throw new Error("You've made too many requests. Please wait a moment and try again.");
    }
    if (data.error.includes("Payment required") || data.error.includes("unavailable")) {
      throw new Error("The AI service is temporarily unavailable. Please try again later.");
    }
    throw new Error(data.error);
  }

  // Validate required fields
  if (!data?.insight || typeof data.moodScore !== 'number' || !Array.isArray(data.tips)) {
    throw new Error("Received an incomplete response. Please try again.");
  }

  setCurrentStep(2);
  setAiResponse(data);

  // Only save if we have complete data
  const { error: saveError } = await supabase.from("mood_logs").insert({
    user_id: user.id,
    mood_text: moodText.trim(),
    ai_response: data.insight,
    mood_score: data.moodScore,
    emotions: data.emotions || [],
    tips: data.tips,
  });

  // ... rest of save logic
} catch (error) {
  console.error("Error analyzing mood:", error);
  toast({
    title: "Analysis failed",
    description: error instanceof Error ? error.message : "Please try again in a moment.",
    variant: "destructive",
  });
  setCurrentStep(0);
}
```

### File: supabase/functions/analyze-mood/index.ts

**Add timeout and response validation:**

```typescript
// Add timeout to AI gateway request
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 30000);

try {
  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    // ... existing config
    signal: controller.signal,
  });
  clearTimeout(timeoutId);
  
  // ... existing processing
  
  // Validate parsed response before returning
  if (!parsedResponse.insight || typeof parsedResponse.moodScore !== 'number') {
    console.error("Incomplete AI response:", parsedResponse);
    return new Response(
      JSON.stringify({ error: "AI returned incomplete response. Please try again." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
} catch (error) {
  clearTimeout(timeoutId);
  if (error.name === 'AbortError') {
    return new Response(
      JSON.stringify({ error: "Request timed out. Please try again." }),
      { status: 504, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
  throw error;
}
```

### File: supabase/config.toml

**Add function configuration:**

```toml
project_id = "tajzfaqmmiayfoyvfvrk"

[functions.analyze-mood]
verify_jwt = false
```

---

## Summary of Changes

| File | Changes |
|------|---------|
| `src/pages/MoodAnalyzer.tsx` | Add error field check, response validation, defensive rendering |
| `supabase/functions/analyze-mood/index.ts` | Add timeout, validate AI response, ensure proper HTTP status codes |
| `supabase/config.toml` | Add function configuration |

## Expected Outcome

After these changes:
- Users will see helpful error toasts instead of a white screen
- Rate limit errors will show a specific message asking to wait
- Incomplete AI responses won't be saved to the database
- The dashboard won't show entries with missing AI insights
- The app will gracefully handle network timeouts

