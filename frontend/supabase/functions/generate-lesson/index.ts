import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { subject, difficulty, language, learningStyle } = await req.json();

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      throw new Error('Unauthorized');
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const prompt = `Generate a comprehensive ${difficulty}-level lesson about ${subject} in ${language}.
    
The lesson should be optimized for ${learningStyle} learners.

Include:
1. Introduction (engaging hook)
2. Main Concepts (3-5 key points with examples)
3. Interactive Examples (2-3 practical examples)
4. Practice Questions (3 questions with answers)
5. Summary (key takeaways)

Format as JSON:
{
  "title": "...",
  "introduction": "...",
  "concepts": [{"title": "...", "content": "...", "example": "..."}],
  "examples": [{"scenario": "...", "solution": "..."}],
  "questions": [{"question": "...", "answer": "..."}],
  "summary": "..."
}`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You are an expert educator. Create engaging, clear lessons. Always respond with valid JSON.' },
          { role: 'user', content: prompt }
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const lessonContent = JSON.parse(data.choices[0].message.content);

    // Save lesson to database
    const { data: lesson, error: insertError } = await supabaseClient
      .from('lessons')
      .insert({
        user_id: user.id,
        title: lessonContent.title,
        subject,
        difficulty,
        language,
        content: lessonContent,
      })
      .select()
      .single();

    if (insertError) throw insertError;

    return new Response(JSON.stringify({ lesson }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
