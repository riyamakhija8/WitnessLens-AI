import { BACKEND_API_URL } from "@/lib/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ProxyContext = {
  params: Promise<{
    path: string[];
  }>;
};

const HOP_BY_HOP_HEADERS = new Set([
  "connection",
  "content-length",
  "host",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade"
]);

export async function GET(request: Request, context: ProxyContext) {
  return proxyToBackend(request, context);
}

export async function POST(request: Request, context: ProxyContext) {
  return proxyToBackend(request, context);
}

async function proxyToBackend(request: Request, context: ProxyContext) {
  const { path } = await context.params;
  const sourceUrl = new URL(request.url);
  const targetUrl = `${BACKEND_API_URL.replace(/\/$/, "")}/${path.join("/")}${sourceUrl.search}`;
  const requestHeaders = copyHeaders(request.headers);

  try {
    const backendResponse = await fetch(targetUrl, {
      method: request.method,
      headers: requestHeaders,
      body: request.method === "GET" ? undefined : await request.arrayBuffer(),
      cache: "no-store"
    });

    return new Response(backendResponse.body, {
      status: backendResponse.status,
      statusText: backendResponse.statusText,
      headers: {
        ...Object.fromEntries(copyHeaders(backendResponse.headers).entries()),
        "content-type": backendResponse.headers.get("content-type") ?? "application/json"
      }
    });
  } catch {
    return Response.json(
      {
        detail: "WitnessLens backend is unreachable."
      },
      {
        status: 502
      }
    );
  }
}

function copyHeaders(headers: Headers) {
  const copied = new Headers();

  headers.forEach((value, key) => {
    if (!HOP_BY_HOP_HEADERS.has(key.toLowerCase())) {
      copied.set(key, value);
    }
  });

  return copied;
}
