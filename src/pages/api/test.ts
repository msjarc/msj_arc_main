export const prerender = false;

export async function GET() {
  return new Response("WORKER OK", { status: 200 });
}
