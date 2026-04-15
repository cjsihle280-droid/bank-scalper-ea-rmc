const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GATEWAY_URL = 'https://ai.gateway.lovable.dev/v1/chat/completions';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { symbol, timeframe } = await req.json();

    if (!symbol || typeof symbol !== 'string') {
      return new Response(JSON.stringify({ error: 'Symbol is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const systemPrompt = `You are an expert forex and financial markets analyst specializing in the following trading strategies:

1. **Smart Money Concepts (SMC)**: Analyze for Break of Structure (BOS), Change of Character (CHoCH), order blocks, fair value gaps (FVG), and liquidity sweeps.
2. **Candle Range Theory (CRT)**: Analyze candle ranges for expansion/contraction patterns and predict movement.
3. **Pure Price Action (PA)**: Identify key support/resistance, pin bars, engulfing patterns at key levels.
4. **Asian Range Strategy (AR)**: Evaluate the Asian session range and potential London/NY breakouts.
5. **50% Fibonacci Entry (FIB50)**: Look for retracement to the 50% level of impulse moves.
6. **Quasimodo Pattern (QM)**: Identify QM reversal patterns (HH->LL or LL->HH shifts).
7. **Breakout Strategy (BO)**: Detect consolidation zones and potential breakouts.
8. **714 Method**: Analyze 7 EMA and 14 EMA crossover signals.
9. **NY Session Scalping (NYS)**: Evaluate impulse scalping opportunities during NY session.

For the given symbol and timeframe, provide a comprehensive analysis. You MUST respond in valid JSON with this exact structure:
{
  "overall_bias": "BULLISH" | "BEARISH" | "NEUTRAL",
  "confidence": number (0-100),
  "signals": [
    {
      "strategy_id": "smc" | "crt" | "price_action" | "asian_range" | "fib_50" | "quasimodo" | "breakout" | "method_714" | "ny_scalp",
      "signal": "BUY" | "SELL" | "NEUTRAL",
      "strength": "STRONG" | "MODERATE" | "WEAK",
      "reasoning": "Brief explanation (1-2 sentences)"
    }
  ],
  "key_levels": {
    "support": [number, number],
    "resistance": [number, number]
  },
  "recommendation": "Brief 1-2 sentence summary"
}

Provide realistic analysis based on typical market conditions and the current time of day. Be specific with reasoning for each strategy.`;

    const userPrompt = `Analyze ${symbol} on the ${timeframe || '15M'} timeframe. Generate trading signals using all 9 strategies. Current UTC time: ${new Date().toISOString()}`;

    const response = await fetch(GATEWAY_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`AI API call failed [${response.status}]: ${errText}`);
    }

    const aiData = await response.json();
    const content = aiData.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No content in AI response');
    }

    const signals = JSON.parse(content);

    return new Response(JSON.stringify(signals), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error: unknown) {
    console.error('Signal generation error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
