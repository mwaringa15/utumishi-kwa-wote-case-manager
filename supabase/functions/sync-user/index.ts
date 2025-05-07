
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
    const { id, email, role } = body
    
    if (!id || !email || !role) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    console.log(`Syncing user: ${id}, email: ${email}, role: ${role}`)
    
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
    
    // Insert or update user in the users table
    if (!existingUser) {
      // Insert new user
      const { error: insertError } = await supabase
        .from('users')
        .insert({
          id,
          email,
          role: normalizedRole,
          full_name: email.split('@')[0] // Default name from email
        })
      
      if (insertError) {
        console.error('Error inserting user:', insertError)
        return new Response(
          JSON.stringify({ error: 'Error inserting user' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        )
      }
    } else {
      // Update existing user
      const { error: updateError } = await supabase
        .from('users')
        .update({
          email,
          role: normalizedRole
        })
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
