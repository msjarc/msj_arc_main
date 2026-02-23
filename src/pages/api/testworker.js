export const prerender = false;

export async function GET() {
  return new Response(
    JSON.stringify({ ok: true, runtime: "cloudflare-worker" }),
    { headers: { "content-type": "application/json" } }
  );
}
