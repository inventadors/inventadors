const ROUTES = new Map([
  ["/", "/index.html"],
  ["/index.html", "/index.html"],
  ["/contact", "/contact.html"],
  ["/contact.html", "/contact.html"],
  ["/help", "/help.html"],
  ["/help.html", "/help.html"],
  ["/privacy", "/privacy.html"],
  ["/privacy.html", "/privacy.html"],
  ["/report-an-issue", "/report-an-issue.html"],
  ["/report-an-issue.html", "/report-an-issue.html"],
  ["/terms", "/terms.html"],
  ["/terms.html", "/terms.html"],
  ["/404.html", "/404.html"],
]);

const SECURITY_HEADERS = {
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
};

export default {
  async fetch(request, env) {
    if (request.method !== "GET" && request.method !== "HEAD") {
      return new Response("Method Not Allowed", {
        status: 405,
        headers: {
          Allow: "GET, HEAD",
          ...SECURITY_HEADERS,
        },
      });
    }

    const url = new URL(request.url);
    const pathname = normalizePath(url.pathname);
    const assetPath = ROUTES.get(pathname);

    if (!assetPath) {
      return notFound(request, env);
    }

    return serveAsset(request, env, assetPath);
  },
};

function normalizePath(pathname) {
  if (pathname === "/") return pathname;
  return pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
}

async function serveAsset(request, env, pathname) {
  const url = new URL(request.url);
  url.pathname = pathname;

  const response = await env.ASSETS.fetch(new Request(url, request));
  return withSecurityHeaders(response);
}

async function notFound(request, env) {
  const response = await serveAsset(request, env, "/404.html");

  return new Response(response.body, {
    status: 404,
    statusText: "Not Found",
    headers: response.headers,
  });
}

function withSecurityHeaders(response) {
  const headers = new Headers(response.headers);

  for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
    headers.set(name, value);
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
