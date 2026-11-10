import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

async function sha256(value: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const { code } = await req.json();
    if (typeof code !== "string" || code.length < 20 || code.length > 100) {
      return json({ error: "الرابط غير صالح" }, 400);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } }
    );
    const tokenHash = await sha256(code);

    // Atomic consume: only one request can change redeemed_at from NULL.
    const { data, error } = await supabase
      .from("single_use_download_links")
      .update({ redeemed_at: new Date().toISOString() })
      .eq("token_hash", tokenHash)
      .is("redeemed_at", null)
      .select("apk_url, app_name")
      .maybeSingle();

    if (error) throw error;
    if (!data) return json({ error: "هذا الرابط مستخدم مسبقاً أو غير صالح." }, 410);
    return json({ apkUrl: data.apk_url, appName: data.app_name });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : "تعذر التحقق من الرابط" }, 400);
  }
});
