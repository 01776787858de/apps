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
    const { adminKey, apkUrl, appName } = await req.json();
    const expected = Deno.env.get("ADMIN_API_KEY");
    if (!expected || typeof adminKey !== "string" || adminKey !== expected) {
      return json({ error: "مفتاح الإدارة غير صحيح" }, 401);
    }

    const parsed = new URL(apkUrl);
    if (
      parsed.origin !== "https://01776787858.github.io" ||
      !parsed.pathname.startsWith("/apps/") ||
      !parsed.pathname.toLowerCase().endsWith(".apk")
    ) return json({ error: "يسمح فقط بروابط APK الموجودة في مستودع apps" }, 400);

    const tokenBytes = crypto.getRandomValues(new Uint8Array(24));
    const token = btoa(String.fromCharCode(...tokenBytes)).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
    const tokenHash = await sha256(token);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } }
    );
    const { error } = await supabase.from("single_use_download_links").insert({
      token_hash: tokenHash,
      app_name: String(appName || "APK").slice(0, 120),
      apk_url: parsed.toString(),
    });
    if (error) throw error;

    const base = (Deno.env.get("APP_BASE_URL") || "https://01776787858.github.io/apps").replace(/\/$/, "");
    return json({ downloadUrl: base + "/download.html?code=" + encodeURIComponent(token) });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : "تعذر إنشاء الرابط" }, 400);
  }
});
