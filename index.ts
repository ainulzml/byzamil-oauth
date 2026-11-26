import decapCMSLoginScript from './decap-cms-login-script';

export default {
  async fetch(request, env) {
    const client_id = env.CLIENT_ID;
    const client_secret = env.CLIENT_SECRET;

    const { pathname, searchParams: params } = new URL(request.url);

    if (pathname === '/auth') {
      return Response.redirect(
        `https://github.com/login/oauth/authorize?client_id=${client_id}&scope=repo,user`,
        302
      );
    }

    if (pathname === '/callback') {
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

        const loginResponse = decapCMSLoginScript(response.access_token);
        return new Response(loginResponse, {
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
