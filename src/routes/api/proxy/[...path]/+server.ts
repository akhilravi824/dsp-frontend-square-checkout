import type { RequestHandler } from './$types';
import { env as pub } from '$env/dynamic/public';
import { env as priv } from '$env/dynamic/private';

const BE = (pub.PUBLIC_API_URL ?? '').replace(/\/$/, '');

// Optional: for Vercel Deployment Protection on the *backend* preview.
// Create a Vercel Protection Bypass token and store it in the FRONTEND (Preview) as VERCEL_BYPASS_TOKEN.
const BYPASS = priv.VERCEL_BYPASS_TOKEN; // DO NOT prefix PUBLIC_

function makeUrl(path: string, search: string) {
  if (!BE) throw new Error('PUBLIC_API_URL not set');
  const clean = path ? `/${path.replace(/^\/+/, '')}` : '';
  return `${BE}${clean}${search ?? ''}`;
}

async function forward(e, method: string) {
  const { params, url, request } = e;
  const raw = params.path;
  const path = Array.isArray(raw) ? raw.join('/') : (raw ?? '');

  const headers: Record<string, string> = {};
  const auth = request.headers.get('authorization'); if (auth) headers.authorization = auth;
  const ct   = request.headers.get('content-type');  if (ct) headers['content-type'] = ct;
  const cookie = request.headers.get('cookie');      if (cookie) headers.cookie = cookie;

  // Add protection bypass header only in preview if you have it configured
  if (BYPASS) headers['x-vercel-protection-bypass'] = BYPASS;

  const body = !['GET','HEAD'].includes(method) ? await request.arrayBuffer() : undefined;
  const r = await fetch(makeUrl(path, url.search), { method, headers, body: body && new Uint8Array(body) });

  const out = new Headers(r.headers);
  out.delete('access-control-allow-origin');
  out.delete('access-control-allow-credentials');

  return new Response(await r.arrayBuffer(), { status: r.status, headers: out });
}

export const GET:RequestHandler    = (e) => forward(e, 'GET');
export const POST:RequestHandler   = (e) => forward(e, 'POST');
export const PUT:RequestHandler    = (e) => forward(e, 'PUT');
export const PATCH:RequestHandler  = (e) => forward(e, 'PATCH');
export const DELETE:RequestHandler = (e) => forward(e, 'DELETE');
export const OPTIONS:RequestHandler= async () => new Response('', { status: 204 });
