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
    
    // Normalize the role name
    // Ensures "OCS" is always "OCS", other roles are TitleCased.
    let normalizedRole = role;
    if (typeof role === 'string') {
      if (role.toLowerCase() === 'ocs') {
        normalizedRole = 'OCS';
      } else {
        normalizedRole = role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
      }
    } else {
      // Handle cases where role might not be a string, though it's expected to be.
      // Defaulting to 'Public' or returning an error might be options.
      // For now, let's log an error if role is not a string and proceed with it as is,
      // which will likely fail validation or later steps if it's not a valid role string.
      console.error(`Role is not a string: ${role}. Proceeding with original value.`);
    }

    console.log(`Syncing user: ${id}, email: ${email}, role: ${normalizedRole}, station_id: ${station_id}`)
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
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
      station_id?: string | null; // Allow station_id to be explicitly set to null to clear it
    } = {
      email,
      role: normalizedRole,
    };

    // Handle station_id: allow it to be updated or cleared
    // If station_id is provided (even as null), include it in userData.
    // If station_id is undefined in the body, it won't be in userData, preserving existing DB value.
    if (station_id !== undefined) {
        userData.station_id = station_id; // This could be a string UUID or null
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
        // Provide more detailed error if it's a constraint violation
        if (insertError.code === '23514' && insertError.message.includes('users_role_check')) {
            return new Response(
                JSON.stringify({ error: `Invalid role specified: ${normalizedRole}. Allowed roles are Public, Officer, OCS, Commander, Administrator, Judiciary, Supervisor.` }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
            );
        }
        return new Response(
          JSON.stringify({ error: 'Error inserting user', details: insertError.message }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        )
      }
    } else {
      // Update existing user
      // Create updatePayload, only including fields that are actually being changed.
      const updatePayload: { email: string; role: string; station_id?: string | null } = {
        email, // email can always be updated
        role: normalizedRole, // role can always be updated
      };

      // Only include station_id in update if it's explicitly provided in the body
      if (station_id !== undefined) {
        updatePayload.station_id = station_id; // can be string or null
      }
      // Note: If station_id is not in the body, it's not included in updatePayload,
      // so existing station_id in DB is preserved.

      const { error: updateError } = await supabase
        .from('users')
        .update(updatePayload)
        .eq('id', id)
      
      if (updateError) {
        console.error('Error updating user:', updateError)
        if (updateError.code === '23514' && updateError.message.includes('users_role_check')) {
            return new Response(
                JSON.stringify({ error: `Invalid role specified: ${normalizedRole}. Allowed roles are Public, Officer, OCS, Commander, Administrator, Judiciary, Supervisor.` }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
            );
        }
        return new Response(
          JSON.stringify({ error: 'Error updating user', details: updateError.message }),
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
        // If role insert fails due to user_roles_role_check, it indicates a problem similar to users_role_check
        if (roleInsertError.code === '23514' && roleInsertError.message.includes('user_roles_role_check')) {
             console.warn(`Could not insert role ${normalizedRole} into user_roles due to check constraint. This might require a similar fix as users_role_check.`);
        } else {
            console.error('Error inserting role into user_roles:', roleInsertError);
        }
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
      JSON.stringify({ error: 'Internal Server Error', details: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
