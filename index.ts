import decapCMSLoginScript from './decap-cms-login-script';

export default {
  async fetch(request, env) {
    const client_id = env.CLIENT_ID;
    const client_secret = env.CLIENT_SECRET;
    const url = new URL(request.url);
    const params = url.searchParams;

    if (url.pathname === '/auth') {
      return Response.redirect(
        `https://github.com/login/oauth/authorize?client_id=${client_id}&scope=repo,user`,
        302
      );
    }

    // GitHub bisa balik ke /callback atau /?code=... — handle dua-duanya
    if (url.pathname === '/callback' || params.has('code')) {
      try {
        const code = params.get('code');
        const response = await fetch('https://github.com/login/oauth/access_token', {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            'user-agent': 'decap-cms-github-oauth-api-cloudflare',
            accept: 'application/json',
          },
          body: JSON.stringify({ client_id, client_secret, code }),
        }).then((res) => res.json());

        return new Response(decapCMSLoginScript(response.access_token), {
          status: 201,
          headers: { 'Content-Type': 'text/html;charset=UTF-8' },
        });
      } catch (err) {
        return new Response(err.message, { status: 500 });
      }
    }

    return new Response('Not found', { status: 404 });
  },
};
