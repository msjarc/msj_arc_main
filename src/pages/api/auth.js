export const prerender = false
export async function GET({ request }) {
    const client_id = import.meta.env.GITHUB_CLIENT_ID;

    try {
        const url = new URL(request.url);
        const redirectUrl = new URL('https://github.com/login/oauth/authorize');
        redirectUrl.searchParams.set('client_id', client_id);
        redirectUrl.searchParams.set('redirect_uri', url.origin + '/api/callback');
        redirectUrl.searchParams.set('scope', 'repo user');
        redirectUrl.searchParams.set(
            'state',
            crypto.getRandomValues(new Uint8Array(12)).join(''),
        );
        return Response.redirect(redirectUrl.href, 301);

    } catch (error) {
        console.error(error);
        return new Response(error.message, {
            status: 500,
        });
    }
}
