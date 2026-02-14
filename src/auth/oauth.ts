/**
 * OAuth2 Authorization Code flow for TickTick / Dida365.
 *
 * Spins up a temporary local HTTP server to receive the callback,
 * exchanges the code for tokens, and writes them to a .env file.
 */

import http from "node:http";
import { URL } from "node:url";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import type { TokenData, TickTickHost } from "../types.js";

const REDIRECT_PORT = 42813;
const REDIRECT_URI = `http://localhost:${REDIRECT_PORT}/callback`;

function authUrl(host: TickTickHost): string {
  return host === "dida365"
    ? "https://dida365.com/oauth/authorize"
    : "https://ticktick.com/oauth/authorize";
}

function tokenUrl(host: TickTickHost): string {
  return host === "dida365"
    ? "https://dida365.com/oauth/token"
    : "https://ticktick.com/oauth/token";
}

export interface AuthResult {
  accessToken: string;
  refreshToken?: string;
}

/**
 * Run the full OAuth2 authorization code flow.
 *
 * 1. Opens the user's browser to the TickTick authorize page.
 * 2. Listens on localhost for the callback with the auth code.
 * 3. Exchanges the code for access + refresh tokens.
 * 4. Optionally writes tokens to a .env file.
 */
export async function runOAuthFlow(opts: {
  clientId: string;
  clientSecret: string;
  host: TickTickHost;
  envPath?: string;
  extraVars?: Record<string, string>;
}): Promise<AuthResult> {
  const { clientId, clientSecret, host } = opts;
  const state = crypto.randomBytes(16).toString("hex");

  // Build authorization URL
  const params = new URLSearchParams({
    client_id: clientId,
    scope: "tasks:write tasks:read",
    state,
    redirect_uri: REDIRECT_URI,
    response_type: "code",
  });

  const authorizeUrl = `${authUrl(host)}?${params.toString()}`;

  // Wait for the callback code
  const code = await waitForCallback(state, authorizeUrl);

  // Exchange code for tokens
  const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString(
    "base64",
  );
  const res = await fetch(tokenUrl(host), {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${basicAuth}`,
    },
    body: new URLSearchParams({
      code,
      grant_type: "authorization_code",
      scope: "tasks:write tasks:read",
      redirect_uri: REDIRECT_URI,
    }).toString(),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Token exchange failed: ${res.status} – ${text}`);
  }

  const data = (await res.json()) as TokenData;

  // Write to .env if path given
  if (opts.envPath) {
    writeEnv(opts.envPath, {
      TICKTICK_CLIENT_ID: clientId,
      TICKTICK_CLIENT_SECRET: clientSecret,
      TICKTICK_ACCESS_TOKEN: data.access_token,
      TICKTICK_REFRESH_TOKEN: data.refresh_token ?? "",
      TICKTICK_HOST: host,
      ...(opts.extraVars ?? {}),
    });
  }

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
  };
}

// ---------------------------------------------------------------------------
// Local callback server
// ---------------------------------------------------------------------------

function waitForCallback(
  expectedState: string,
  authorizeUrl: string,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      const url = new URL(req.url ?? "/", `http://localhost:${REDIRECT_PORT}`);

      if (url.pathname !== "/callback") {
        res.writeHead(404);
        res.end("Not found");
        return;
      }

      const code = url.searchParams.get("code");
      const state = url.searchParams.get("state");

      if (state !== expectedState) {
        res.writeHead(400);
        res.end("State mismatch – possible CSRF. Please try again.");
        server.close();
        reject(new Error("OAuth state mismatch"));
        return;
      }

      if (!code) {
        res.writeHead(400);
        res.end("No authorization code received.");
        server.close();
        reject(new Error("No auth code in callback"));
        return;
      }

      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(
        `<!DOCTYPE html><html><body style="font-family:system-ui;text-align:center;padding:60px">
        <h1>&#10004; Authorization successful!</h1>
        <p>You can close this tab and return to your terminal.</p>
        </body></html>`,
      );

      server.close();
      resolve(code);
    });

    server.listen(REDIRECT_PORT, () => {
      console.error(
        `\n  OAuth callback server listening on port ${REDIRECT_PORT}`,
      );
      console.error(`\n  Open this URL in your browser to authorize:\n`);
      console.error(`  ${authorizeUrl}\n`);

      // Try to open the browser automatically
      import("open")
        .then((mod) => mod.default(authorizeUrl))
        .catch(() => {
          // open is optional; user can copy-paste the URL
        });
    });

    // Timeout after 5 minutes
    setTimeout(() => {
      server.close();
      reject(new Error("OAuth flow timed out after 5 minutes"));
    }, 5 * 60 * 1000);
  });
}

// ---------------------------------------------------------------------------
// .env writer
// ---------------------------------------------------------------------------

function writeEnv(envPath: string, vars: Record<string, string>): void {
  let existing: Record<string, string> = {};

  // Read existing .env if present
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, "utf-8");
    for (const line of content.split("\n")) {
      const match = line.match(/^([A-Z_]+)=(.*)$/);
      if (match) {
        existing[match[1]] = match[2];
      }
    }
  }

  // Merge
  const merged = { ...existing, ...vars };
  const dir = path.dirname(envPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const lines = Object.entries(merged)
    .map(([k, v]) => `${k}=${v}`)
    .join("\n");
  fs.writeFileSync(envPath, lines + "\n", "utf-8");
  console.error(`  Tokens saved to ${envPath}`);
}
