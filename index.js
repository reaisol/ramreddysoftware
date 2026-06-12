import { onRequestPost } from './functions/api/contact.js';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Route POST /api/contact requests to our contact form handler
    if (url.pathname === '/api/contact' && request.method === 'POST') {
      return await onRequestPost({ request, env });
    }

    // Serve all other requests from the static assets directory
    return env.ASSETS.fetch(request);
  }
};
