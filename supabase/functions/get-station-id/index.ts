
// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0"

console.log("Hello from get-station-id function!")

serve(async (req) => {
  try {
    // Set up CORS headers for browser clients
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      'Content-Type': 'application/json'
    };

    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
      return new Response(null, {
        headers: corsHeaders,
        status: 204,
      });
    }
    
    // Create a Supabase client with the Auth context of the logged in user.
    const supabaseClient = createClient(
      // Supabase API URL - env var exported by default.
      Deno.env.get('SUPABASE_URL') ?? '',
      // Supabase API ANON KEY - env var exported by default.
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      // Create client with Auth context of the user that called the function.
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get the current user
    const {
      data: { user },
    } = await supabaseClient.auth.getUser()

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Not authenticated' }),
        {
          headers: corsHeaders,
          status: 401,
        },
      )
    }

    // Get the user's station ID from the users table
    const { data: userData, error: userError } = await supabaseClient
      .from('users')
      .select('station_id, role')
      .eq('id', user.id)
      .single();

    if (userError) {
      console.error("Error fetching user's station_id:", userError);
      throw userError;
    }

    console.log(`User ${user.id} has station_id: ${userData?.station_id || 'null'} and role: ${userData?.role || 'null'}`);
    
    // Make sure to normalize the role to lowercase for consistency
    const normalizedRole = userData?.role ? userData.role.toLowerCase() : "public";
    console.log(`Normalized role: ${normalizedRole}`);

    // Map old role names if they exist in the database
    let finalRole = normalizedRole;
    if (["administrator", "ocs", "commander"].includes(normalizedRole)) {
      finalRole = 'supervisor';
      console.log(`Mapping old role ${normalizedRole} to supervisor`);
    }

    return new Response(
      JSON.stringify({
        station_id: userData?.station_id || null,
        user_id: user.id,
        role: finalRole  // Return the normalized role
      }),
      {
        headers: corsHeaders,
        status: 200,
      },
    )
  } catch (error) {
    console.error("Error in get-station-id function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})
