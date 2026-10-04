import { createClient } from "@supabase/supabase-js";
import { corsHeaders } from "@supabase/supabase-js/cors";
import process from "node:process";
import { validId } from "../_shared/validation.ts";

export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const headers: Record<string, string> = { ...corsHeaders, "Access-Control-Allow-Methods": "GET, POST, OPTIONS", "X-Function-Path": url.pathname, "X-Function-Query": url.search };
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers });
    if (!["GET", "POST"].includes(request.method)) return Response.json({ error: "Method not allowed" }, { status: 405, headers });
    try {
      const keys = JSON.parse(process.env.SUPABASE_PUBLISHABLE_KEYS ?? "{}");
      const key = keys.default ?? process.env.SUPABASE_ANON_KEY;
      if (!key) throw new Error("Supabase key is not configured");
      const supabase = createClient(process.env.SUPABASE_URL!, key, {
        auth: { persistSession: false, autoRefreshToken: false },
        global: { headers: { Authorization: request.headers.get("Authorization") ?? `Bearer ${key}` } },
      });
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) return Response.json({ error: "Sign in first" }, { status: 401, headers });
      headers["X-Caller-ID"] = user.id;
      if (request.method === "GET") {
        const id = validId(url.pathname.split("/")[2]);
        const { data, error } = await supabase.from("tasks").select("id,owner_id,title,completed,attachment_path").eq("id", id).single();
        if (error) return Response.json({ error: error.message }, { status: error.code === "PGRST116" ? 404 : 400, headers });
        return Response.json(data, { headers });
      }
      const body = await request.json();
      const id = validId(body.id);
      if (body.action === "create") {
        if (typeof body.title !== "string" || !body.title.trim() || body.title.length > 200) throw new Error("Invalid task title");
        const { data, error } = await supabase.from("tasks").insert({ id, title: body.title.trim(), completed: 0 }).select("id,owner_id,title,completed,attachment_path").single();
        if (error) return Response.json({ error: error.message }, { status: error.code === "PGRST116" ? 404 : 400, headers });
        return Response.json(data, { status: 201, headers });
      }
      if (body.action === "complete") {
        const { data, error } = await supabase.from("tasks").update({ completed: 1 }).eq("id", id).select("id,owner_id,title,completed,attachment_path").single();
        if (error) return Response.json({ error: error.message }, { status: error.code === "PGRST116" ? 404 : 400, headers });
        return Response.json(data, { headers });
      }
      return Response.json({ error: "Unknown action" }, { status: 400, headers });
    } catch (error) {
      return Response.json({ error: error instanceof Error ? error.message : String(error) }, { status: 400, headers });
    }
  },
};
