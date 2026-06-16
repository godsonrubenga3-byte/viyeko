import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const { requestId, bidId } = await req.json()

    if (!requestId || !bidId) {
      throw new Error("Missing requestId or bidId")
    }

    // Initialize Supabase Client with the caller's JWT to verify identity
    const authHeader = req.headers.get("Authorization")
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader ?? "" } } }
    )

    // Get the caller's user object
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    if (authError || !user) throw new Error("Unauthorized")

    // Initialize Admin Client for the actual database updates
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    )

    // 1. Fetch the request to ensure it belongs to the caller AND is in valid status
    const { data: request, error: reqError } = await supabaseAdmin
      .from('assistance_requests')
      .select('status, user_id')
      .eq('id', requestId)
      .single()

    if (reqError || !request) throw new Error("Request not found.")
    if (request.user_id !== user.id) {
      throw new Error("You are not authorized to accept bids for this request.")
    }
    if (request.status !== 'searching' && request.status !== 'bidding') {
      throw new Error("This request is no longer accepting bids.")
    }

    // 2. Fetch the exact bid from the secure relational table
    const { data: bid, error: bidError } = await supabaseAdmin
      .from('assistance_bids')
      .select('*')
      .eq('id', bidId)
      .single()

    if (bidError || !bid) {
      throw new Error("Bid not found or invalid.")
    }

    // 3. Lock the contract using the SERVER-SIDE verified pricing
    const { error: updateError } = await supabaseAdmin
      .from('assistance_requests')
      .update({
        status: 'assigned',
        provider_id: bid.provider_id,
        accepted_bid_id: bid.id,
        total_cost: bid.price,
        estimated_arrival: bid.eta,
        last_updated_by: 'driver'
      })
      .eq('id', requestId)

    if (updateError) throw updateError

    return new Response(JSON.stringify({ success: true, message: "Contract locked securely." }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    })
  }
})
