import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version, x-target-path, x-target-method",
};

const API_BASE = "https://solutioniq.cloud/api/v1";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const accessToken = Deno.env.get("SOLUTIONIQ_ACCESS_TOKEN");
    console.log("Token exists:", !!accessToken, "Length:", accessToken?.length || 0, "First 4 chars:", accessToken?.substring(0, 4) || "N/A");
    if (!accessToken) {
      return new Response(
        JSON.stringify({ error: "Access token not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const targetPath = req.headers.get("x-target-path") || "/health";
    const targetMethod = req.headers.get("x-target-method") || req.method;

    const url = `${API_BASE}${targetPath}`;

    const headers: Record<string, string> = {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    };

    const fetchOptions: RequestInit = {
      method: targetMethod,
      headers,
    };

    if (targetMethod !== "GET" && targetMethod !== "HEAD") {
      try {
        const body = await req.text();
        if (body) fetchOptions.body = body;
      } catch {
        // no body
      }
    }

    const response = await fetch(url, fetchOptions);
    const responseBody = await response.text();

    return new Response(responseBody, {
      status: response.status,
      headers: {
        ...corsHeaders,
        "Content-Type": response.headers.get("Content-Type") || "application/json",
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
