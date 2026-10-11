import test from "node:test";
import assert from "node:assert/strict";
import { createHarness } from "./helpers/lite.mjs";
for (const backend of ["node", "libsql"])
  test(`${backend}: browser Auth CORS permits only configured frontend origins`, async (t) => {
    const origin = "http://localhost:5173";
    const h = await createHarness({
      backend,
      auth: {
        enabled: true,
        site_url: origin,
        additional_redirect_urls: [
          "https://preview.example.test/auth/callback",
        ],
        jwt_secret: "cors-fixture-only-secret-123",
        publishable_key: "cors-fixture-only-key",
        email: { enable_confirmations: false },
      },
    });
    t.after(h.close);
    for (const endpoint of [
      "/auth/v1/user",
      "/auth/v1/token?grant_type=password",
      "/auth/v1/signup",
      "/rest/v1/rpc/fixture",
    ]) {
      const requested = [
        "authorization",
        "apikey",
        "content-type",
        "x-client-info",
        "x-supabase-api-version",
      ];
      for (const allowedOrigin of [origin, "https://preview.example.test"]) {
        const response = await h.app.fetch(
          new Request(`http://localhost${endpoint}`, {
            method: "OPTIONS",
            headers: {
              Origin: allowedOrigin,
              "Access-Control-Request-Method":
                endpoint === "/auth/v1/user" ? "GET" : "POST",
              "Access-Control-Request-Headers": requested.join(", "),
            },
          }),
        );
        assert.equal(response.status, 204);
        assert.equal(
          response.headers.get("Access-Control-Allow-Origin"),
          allowedOrigin,
        );
        const allowed = response.headers
          .get("Access-Control-Allow-Headers")
          ?.toLowerCase()
          .split(/\s*,\s*/);
        for (const header of requested)
          assert.ok(allowed?.includes(header), header);
      }
      const denied = await h.app.fetch(
        new Request(`http://localhost${endpoint}`, {
          method: "OPTIONS",
          headers: {
            Origin: "https://unconfigured.example.test",
            "Access-Control-Request-Method": "POST",
          },
        }),
      );
      assert.equal(denied.headers.get("Access-Control-Allow-Origin"), null);
    }
    for (const frontend of [origin, "https://unconfigured.example.test"]) {
      const denied = await h.app.fetch(
        new Request("http://localhost/auth/v1/user", {
          headers: { Origin: frontend, apikey: "cors-fixture-only-key" },
        }),
      );
      assert.equal(denied.status, 401);
      assert.equal(
        denied.headers.get("Access-Control-Allow-Origin"),
        frontend === origin ? origin : null,
      );
    }
  });
