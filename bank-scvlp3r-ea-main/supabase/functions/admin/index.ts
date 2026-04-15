import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const ADMIN_PASSWORD = "RMCCODERS";

function generateKey(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const parts: string[] = [];
  for (let i = 0; i < 4; i++) {
    let part = "";
    for (let j = 0; j < 4; j++) {
      part += chars[Math.floor(Math.random() * chars.length)];
    }
    parts.push(part);
  }
  return parts.join("-");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { action, password, keyId, licenseKey, expiresAt } = await req.json();

    // Validate admin password for all actions except license validation
    if (action !== "validate_key" && action !== "activate_key") {
      if (password !== ADMIN_PASSWORD) {
        return new Response(JSON.stringify({ error: "Invalid admin password" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    switch (action) {
      case "login": {
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "generate_key": {
        const key = generateKey();
        const { data, error } = await supabase
          .from("license_keys")
          .insert({
            license_key: key,
            status: "active",
            expires_at: expiresAt || null,
          })
          .select()
          .single();

        if (error) throw error;
        return new Response(JSON.stringify({ success: true, key: data }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "list_keys": {
        const { data, error } = await supabase
          .from("license_keys")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;
        return new Response(JSON.stringify({ success: true, keys: data }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "deactivate_key": {
        const { error } = await supabase
          .from("license_keys")
          .update({ status: "inactive" })
          .eq("id", keyId);

        if (error) throw error;
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "reactivate_key": {
        const { error } = await supabase
          .from("license_keys")
          .update({ status: "active" })
          .eq("id", keyId);

        if (error) throw error;
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "delete_key": {
        const { error } = await supabase
          .from("license_keys")
          .delete()
          .eq("id", keyId);

        if (error) throw error;
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "validate_key": {
        const { data, error } = await supabase
          .from("license_keys")
          .select("*")
          .eq("license_key", licenseKey)
          .single();

        if (error || !data) {
          return new Response(JSON.stringify({ valid: false, error: "Invalid license key" }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        if (data.status !== "active") {
          return new Response(JSON.stringify({ valid: false, error: "License key is " + data.status }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        if (data.expires_at && new Date(data.expires_at) < new Date()) {
          await supabase
            .from("license_keys")
            .update({ status: "expired" })
            .eq("id", data.id);

          return new Response(JSON.stringify({ valid: false, error: "License key has expired" }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        return new Response(JSON.stringify({ valid: true, key: data }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "activate_key": {
        const { data, error } = await supabase
          .from("license_keys")
          .select("*")
          .eq("license_key", licenseKey)
          .single();

        if (error || !data) {
          return new Response(JSON.stringify({ valid: false, error: "Invalid license key" }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        if (data.status !== "active") {
          return new Response(JSON.stringify({ valid: false, error: "License key is " + data.status }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        if (data.expires_at && new Date(data.expires_at) < new Date()) {
          await supabase.from("license_keys").update({ status: "expired" }).eq("id", data.id);
          return new Response(JSON.stringify({ valid: false, error: "License key has expired" }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Mark as activated
        await supabase
          .from("license_keys")
          .update({ activated_at: new Date().toISOString() })
          .eq("id", data.id);

        return new Response(JSON.stringify({ valid: true, key: data }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      default:
        return new Response(JSON.stringify({ error: "Unknown action" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
