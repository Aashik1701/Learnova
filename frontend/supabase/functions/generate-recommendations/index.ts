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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get user profile
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      throw new Error('Unauthorized');
    }

    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    // Get user progress
    const { data: progress } = await supabaseClient
      .from('user_progress')
      .select('*, lessons(*)')
      .eq('user_id', user.id)
      .order('last_accessed', { ascending: false })
      .limit(5);

    // Generate personalized recommendations using AI
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const prompt = `You are an AI tutor. Based on this learner profile:
- Learning Style: ${profile?.learning_style || 'visual'}
- Proficiency Level: ${profile?.proficiency_level || 'beginner'}
- Preferred Language: ${profile?.preferred_language || 'en'}
- Recent Activity: ${progress?.map(p => p.lessons?.subject).join(', ') || 'none'}

Generate 3 personalized course recommendations. For each recommendation, provide:
1. Title
2. Subject area
3. Difficulty level (beginner/intermediate/advanced)
4. Brief description (2-3 sentences)
5. Why it's recommended for this user

Return as JSON array with format:
[{"title": "...", "subject": "...", "difficulty": "...", "description": "...", "reason": "..."}]`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You are a helpful AI educational advisor. Always respond with valid JSON.' },
          { role: 'user', content: prompt }
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('AI API error:', error);
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const recommendations = JSON.parse(data.choices[0].message.content);

    return new Response(JSON.stringify({ recommendations }), {
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
