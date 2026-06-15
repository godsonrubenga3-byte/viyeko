import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import * as crypto from "https://deno.land/std@0.168.0/crypto/mod.ts"
import { encode as base64Encode } from "https://deno.land/std@0.168.0/encoding/base64.ts"

const ABLY_API_KEY = Deno.env.get("ABLY_API_KEY") || ""

serve(async (req) => {
  // 1. Handle CORS Preflight
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
      throw new Error("ABLY_API_KEY not set in Edge Function secrets")
    }

    const [keyName, keySecret] = ABLY_API_KEY.split(":")
    const ttl = "3600000"
    const capability = JSON.stringify({ "*": ["*"] })
    const timestamp = Date.now().toString()
    const nonce = Math.random().toString(36).substring(2)

    // Ably Canonical String: keyName, ttl, capability, clientId, timestamp, nonce
    const stringToSign = `${keyName}\n${ttl}\n${capability}\n${clientId}\n${timestamp}\n${nonce}\n`

    // HMAC-SHA256 Sign
    const encoder = new TextEncoder()
    const keyData = encoder.encode(keySecret)
    const messageData = encoder.encode(stringToSign)

    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    )

    const signature = await crypto.subtle.sign("HMAC", cryptoKey, messageData)
    const mac = base64Encode(new Uint8Array(signature))

    const tokenRequest = {
      keyName,
      ttl,
      capability,
      clientId,
      timestamp,
      nonce,
      mac,
    }

    return new Response(JSON.stringify(tokenRequest), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
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
