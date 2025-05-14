
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

// Define cors headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Create Supabase client
const supabaseUrl = 'https://gaimrkcezqbugsxngaca.supabase.co'
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''

// Handle preflight CORS
Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Parse the request body
    const body = await req.json()
    const { id, email, role, station_id } = body // Added station_id
    
    if (!id || !email || !role) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: id, email, or role' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    console.log(`Syncing user: ${id}, email: ${email}, role: ${role}, station_id: ${station_id}`)
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // Normalize the role name
    const normalizedRole = role.charAt(0).toUpperCase() + role.slice(1).toLowerCase()
    
    // Check if user exists in users table
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single()
      
    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is the "no rows returned" error
      console.error('Error fetching user:', fetchError)
      return new Response(
        JSON.stringify({ error: 'Error fetching user' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }
    
    // Prepare user data for insert/update
    const userData: {
      id?: string;
      email: string;
      role: string;
      full_name?: string;
      station_id?: string;
    } = {
      email,
      role: normalizedRole,
    };

    if (station_id) {
      userData.station_id = station_id;
    }

    if (!existingUser) {
      // Insert new user
      userData.id = id;
      userData.full_name = email.split('@')[0]; // Default name from email
      
      const { error: insertError } = await supabase
        .from('users')
        .insert(userData)
      
      if (insertError) {
        console.error('Error inserting user:', insertError)
        return new Response(
          JSON.stringify({ error: 'Error inserting user' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        )
      }
    } else {
      // Update existing user
      // Only include station_id in update if it's explicitly provided
      // If station_id is not in body, userData will not have station_id property,
      // so existing station_id in DB will be preserved.
      // If station_id is in body (even if null or empty string, though front-end sends undefined for empty),
      // it will be updated. The `if (station_id)` check above handles undefined, null, and empty string by not adding it.
      // If we want to allow clearing station_id, then `body` should send `station_id: null`.
      // For now, if `station_id` is a non-empty string, it's updated.
      const updatePayload: { email: string; role: string; station_id?: string } = {
        email,
        role: normalizedRole,
      };
      if (station_id) { // Only update station_id if it's provided and truthy
        updatePayload.station_id = station_id;
      }

      const { error: updateError } = await supabase
        .from('users')
        .update(updatePayload)
        .eq('id', id)
      
      if (updateError) {
        console.error('Error updating user:', updateError)
        return new Response(
          JSON.stringify({ error: 'Error updating user' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        )
      }
    }
    
    // Check if role exists in user_roles table
    const { data: existingRole, error: roleError } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', id)
      .eq('role', normalizedRole)
      .single()
      
    if (roleError && roleError.code !== 'PGRST116') {
      console.error('Error fetching role:', roleError)
      // Not returning error here, as role sync is secondary to user profile update
    }
    
    // Insert role if it doesn't exist
    if (!existingRole) {
      const { error: roleInsertError } = await supabase
        .from('user_roles')
        .insert({
          user_id: id,
          role: normalizedRole
        })
      
      if (roleInsertError) {
        console.error('Error inserting role:', roleInsertError)
        // Not returning error here
      }
    }

    return new Response(
      JSON.stringify({ success: true, message: 'User synced successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error) {
    console.error('Error processing request:', error)
    return new Response(
      JSON.stringify({ error: 'Internal Server Error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
