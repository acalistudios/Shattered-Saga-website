// Cloudflare Worker Proxy for Shattered Saga API Completion calls
// Securely verifies Supabase Auth JWT, decrements energy, and calls AI APIs.

export default {
  async fetch(request, env, ctx) {
    // 1. Handle CORS Preflight request
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Provider, X-Model",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: corsHeaders
      });
    }

    if (request.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405, headers: corsHeaders });
    }

    try {
      // 2. Extract headers and request context
      const provider = request.headers.get("X-Provider")?.toLowerCase();
      const model = request.headers.get("X-Model");
      const authHeader = request.headers.get("Authorization");

      if (!provider || !model) {
        return new Response(JSON.stringify({ error: "Bad Request", message: "Missing provider or model headers" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return new Response(JSON.stringify({ error: "Unauthorized", message: "Missing authorization token" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }

      const jwt = authHeader.split(" ")[1];

      // 3. Initialize Supabase Admin Client inside Worker
      // env.SUPABASE_URL and env.SUPABASE_SERVICE_ROLE_KEY must be configured in Worker settings
      const supabaseUrl = env.SUPABASE_URL;
      const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY;

      if (!supabaseUrl || !supabaseServiceKey) {
        return new Response(JSON.stringify({ error: "Internal Configuration Error", message: "Supabase secrets are missing in Worker" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }

      // Fetch User using token
      const authResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
        headers: {
          "apikey": supabaseServiceKey,
          "Authorization": `Bearer ${jwt}`
        }
      });

      if (!authResponse.ok) {
        return new Response(JSON.stringify({ error: "Unauthorized", message: "Invalid session token" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }

      const userData = await authResponse.json();
      const userId = userData.id;

      // 4. Retrieve Profile & Check Energy Balance
      const profileResponse = await fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${userId}&select=energy_balance,subscription_tier`, {
        headers: {
          "apikey": supabaseServiceKey,
          "Authorization": `Bearer ${supabaseServiceKey}`
        }
      });

      if (!profileResponse.ok) {
        return new Response(JSON.stringify({ error: "Profile Error", message: "Unable to retrieve user profile" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }

      const profiles = await profileResponse.json();
      if (!profiles || profiles.length === 0) {
        return new Response(JSON.stringify({ error: "Profile Error", message: "Profile does not exist" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }

      const energyBalance = profiles[0].energy_balance;
      const subscriptionTier = profiles[0].subscription_tier || 'free';
      const isUnlimited = subscriptionTier === 'adventurer' || subscriptionTier === 'legend';

      if (!isUnlimited && energyBalance <= 0) {
        return new Response(JSON.stringify({
          error: "Insufficient Energy",
          message: "Your active GM is out of energy. Watch a portal vision (ad) to recharge, or attune with a tier package!"
        }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }

      // 5. Decrement Energy Atomically (only if not unlimited subscription)
      if (!isUnlimited) {
        const decrementResponse = await fetch(`${supabaseUrl}/rest/v1/rpc/decrement_user_energy`, {
          method: "POST",
          headers: {
            "apikey": supabaseServiceKey,
            "Authorization": `Bearer ${supabaseServiceKey}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            target_user_id: userId,
            amount: 1
          })
        });

        if (!decrementResponse.ok) {
          return new Response(JSON.stringify({ error: "Energy Update Failed", message: "Failed to deduct energy atomically" }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          });
        }
      }

      // 6. Build Target Completion Call to AI API Provider
      let targetUrl = "";
      let headers = { "Content-Type": "application/json" };
      let apiKey = "";
      const bodyText = await request.text();

      if (provider === "gemini") {
        apiKey = env.DEV_GEMINI_KEY;
        if (!apiKey) throw new Error("DEV_GEMINI_KEY is not configured in worker environment");
        targetUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      } else if (provider === "groq") {
        apiKey = env.DEV_GROQ_KEY;
        if (!apiKey) throw new Error("DEV_GROQ_KEY is not configured in worker environment");
        targetUrl = "https://api.groq.com/openai/v1/chat/completions";
        headers["Authorization"] = `Bearer ${apiKey}`;
      } else if (provider === "cerebras") {
        apiKey = env.DEV_CEREBRAS_KEY;
        if (!apiKey) throw new Error("DEV_CEREBRAS_KEY is not configured in worker environment");
        targetUrl = "https://api.cerebras.ai/v1/chat/completions";
        headers["Authorization"] = `Bearer ${apiKey}`;
      } else {
        return new Response(JSON.stringify({ error: "Unsupported Provider", message: `Provider '${provider}' is not supported.` }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }

      // 7. Make API request to provider
      const apiResponse = await fetch(targetUrl, {
        method: "POST",
        headers: headers,
        body: bodyText
      });

      const responseText = await apiResponse.text();

      // Return response back to client
      return new Response(responseText, {
        status: apiResponse.status,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      });

    } catch (err) {
      return new Response(JSON.stringify({ error: "Internal Server Error", message: err.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
  }
};
