import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { id, password, type, operation, updates } = await req.json()

    if (!id || !password || !type || !operation) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: id, password, type, operation' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Verify the password using the appropriate function
    const functionName = type === 'prompt' ? 'can_modify_prompt' : 'can_modify_comment'
    const { data: canModify, error: verifyError } = await supabase
      .rpc(functionName, { 
        [`${type}_id`]: id, 
        provided_password: password 
      })

    if (verifyError) {
      console.error('Error verifying password:', verifyError)
      return new Response(
        JSON.stringify({ error: 'Failed to verify password' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (!canModify) {
      return new Response(
        JSON.stringify({ error: 'Invalid password' }),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Perform the requested operation
    let result;
    const tableName = type === 'prompt' ? 'prompts' : 'comments'

    if (operation === 'update') {
      if (!updates) {
        return new Response(
          JSON.stringify({ error: 'Updates are required for update operation' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      const { data, error } = await supabase
        .from(tableName)
        .update(updates)
        .eq('id', id)
        .select()

      if (error) {
        console.error('Error updating:', error)
        return new Response(
          JSON.stringify({ error: 'Failed to update' }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }
      result = data
    } else if (operation === 'delete') {
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Error deleting:', error)
        return new Response(
          JSON.stringify({ error: 'Failed to delete' }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }
      result = { success: true }
    } else {
      return new Response(
        JSON.stringify({ error: 'Invalid operation' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    return new Response(
      JSON.stringify({ success: true, data: result }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in modify-with-password function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})