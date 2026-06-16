import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
// Import the official Ably REST SDK (works in Deno/Edge)
import * as Ably from "https://esm.sh/ably@1.2.46/build/ably-web-worker.min.js"

const ABLY_API_KEY = Deno.env.get("ABLY_API_KEY") || ""

// Initialize a single REST client instance for the edge function
const restClient = new Ably.Rest(ABLY_API_KEY)

serve(async (req) => {
  // CORS Preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      },
    })
  }

  try {
    const url = new URL(req.url)
    const clientId = url.searchParams.get("clientId") || "anonymous"

    if (!ABLY_API_KEY) {
      throw new Error("ABLY_API_KEY environment variable is missing")
    }

    // Use the official SDK to generate a Token Request
    // This guarantees the exact format, signature, and App ID that Ably expects
    const tokenRequestData = await restClient.auth.createTokenRequest({
      clientId: clientId,
      capability: JSON.stringify({ "*": ["*"] }),
      ttl: 3600000 // 1 hour
    })

    return new Response(JSON.stringify(tokenRequestData), {
      headers: { 
        "Content-Type": "application/json", 
        "Access-Control-Allow-Origin": "*" 
      },
      status: 200,
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      status: 400,
    })
  }
})
