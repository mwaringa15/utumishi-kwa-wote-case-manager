
// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";

console.log("Hello from get-station-id function!");

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

    // Create a Supabase client with the Auth context of the logged in user
    const supabaseClient = createClient(
      // Supabase API URL - env var exported by default
      Deno.env.get('SUPABASE_URL') ?? '',
      // Supabase API ANON KEY - env var exported by default
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      // Create client with Auth context of the user that called the function
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get the user
    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    if (!user) {
      return new Response(
        JSON.stringify({ error: "Not authorized" }),
        { headers: corsHeaders, status: 401 }
      );
    }

    // Use service_role client to get user data since it's more reliable
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Get the user's role and station from the users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role, station_id')
      .eq('id', user.id)
      .single();

    if (userError && userError.code !== 'PGRST116') {
      console.error("Error fetching user data:", userError);
      return new Response(
        JSON.stringify({ error: "Error fetching user data" }),
        { headers: corsHeaders, status: 400 }
      );
    }

    // If we found user data, return it
    if (userData) {
      return new Response(
        JSON.stringify({
          user_id: user.id,
          email: user.email,
          role: userData.role.toLowerCase(), // Ensure lowercase
          station_id: userData.station_id
        }),
        { headers: corsHeaders, status: 200 }
      );
    }

    // If no user data found, determine role from email
    const email = user.email || "";
    let role = "public";
    
    if (email.endsWith("@police.go.ke")) {
      role = "officer";
    } else if (email.endsWith("@judiciary.go.ke")) {
      role = "judiciary";
    } else if (email.endsWith("@supervisor.go.ke")) {
      role = "supervisor";
    }

    return new Response(
      JSON.stringify({
        user_id: user.id,
        email: user.email,
        role: role,
        station_id: null
      }),
      { headers: corsHeaders, status: 200 }
    );

  } catch (error) {
    console.error("Error in get-station-id function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 500,
      },
    );
  }
});
