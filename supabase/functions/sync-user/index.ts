
// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0"

console.log("Hello from sync-user!")

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

    // Now we can get the session or user object
    const {
      data: { user },
    } = await supabaseClient.auth.getUser()

    // Extract the body payload - handle potential parsing errors
    let body;
    try {
      body = await req.json();
    } catch (parseError) {
      console.error("Error parsing request body:", parseError);
      return new Response(
        JSON.stringify({ error: "Invalid JSON in request body" }),
        { headers: corsHeaders, status: 400 }
      );
    }

    // Validate required fields are present
    const { id, email, role } = body;
    // station_id is optional
    const station_id = body.station_id;
    
    console.log("Received payload:", { id, email, role, station_id });

    if (!id || !email || !role) {
      console.error("Missing required fields in payload");
      return new Response(
        JSON.stringify({ error: "Missing required fields: id, email, and role are required" }),
        { headers: corsHeaders, status: 400 }
      );
    }
    
    // Normalize the role to lowercase to ensure consistency
    let normalizedRole = typeof role === 'string' ? role.toLowerCase() : role;
    console.log("Normalized role:", normalizedRole);

    // Map any old role names to the new simplified roles
    if (["administrator", "ocs", "commander"].includes(normalizedRole)) {
      normalizedRole = 'supervisor';
      console.log(`Mapping old role ${role} to supervisor`);
    }

    // Ensure the role is one of the valid roles (all lowercase)
    if (!['public', 'officer', 'supervisor', 'judiciary'].includes(normalizedRole)) {
      normalizedRole = 'public';
      console.log(`Invalid role ${role} defaulting to public`);
    }

    // Use a service_role client for operations that require elevated privileges
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Get the existing user profile if it exists
    const { data: existingUser, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (userError && userError.code !== 'PGRST116') {
      console.error("Error checking existing user:", userError);
      throw userError;
    }

    console.log("Existing user check:", existingUser ? "Found" : "Not found");

    // Important: Check if station_id is undefined, null, or valid
    const validStationId = station_id || null;

    // Supervisors should always have a station_id assigned if provided
    const needsStationId = normalizedRole === 'supervisor' && validStationId !== null;

    let result;
    if (!existingUser) {
      // Insert a new user profile
      console.log("Creating new user profile with station_id:", validStationId);
      result = await supabase
        .from('users')
        .insert({
          id,
          email,
          role: normalizedRole, // Store the normalized role
          station_id: validStationId, // Use null if not provided
          full_name: email.split('@')[0] // Simple name extraction from email
        });
    } else {
      // Update existing user profile
      console.log("Updating existing user profile");
      
      // Always update with the normalized role and maintain station assignment
      const updateData: any = { 
        email,
        role: normalizedRole
      };
      
      // Only update station_id if provided or if user is a supervisor that needs one
      if (validStationId !== undefined || needsStationId) {
        updateData.station_id = validStationId;
      }
      
      result = await supabase
        .from('users')
        .update(updateData)
        .eq('id', id);
    }

    if (result.error) {
      console.error("Error syncing user:", result.error);
      throw result.error;
    }

    // For supervisors, if station_id is provided, store it immediately
    if (normalizedRole === 'supervisor' && validStationId) {
      // Get station name for the response
      const { data: stationData } = await supabase
        .from('stations')
        .select('name')
        .eq('id', validStationId)
        .single();
        
      const stationName = stationData?.name || "Unknown Station";
      
      return new Response(
        JSON.stringify({
          message: `User ${id} has been synced successfully with station assignment`,
          user_id: id,
          email: email,
          role: normalizedRole,
          station_id: validStationId,
          station_name: stationName
        }),
        {
          headers: corsHeaders,
          status: 200,
        },
      );
    }

    // Return regular success response
    return new Response(
      JSON.stringify({
        message: `User ${id} has been synced successfully`,
        user_id: id,
        email: email,
        role: normalizedRole,
        station_id: validStationId
      }),
      {
        headers: corsHeaders,
        status: 200,
      },
    )
  } catch (error) {
    console.error("Error in sync-user function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})
