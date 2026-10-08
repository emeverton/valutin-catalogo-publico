import assert from "node:assert/strict";
import { describe, it } from "node:test";

const PRESERVE = [
  "src",
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "fbclid",
  "gclid",
  "gbraid",
  "wbraid",
];

function preserveSearch(search) {
  const params = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
  params.delete("retail");
  params.delete("retail_confirmed");
  params.delete("blocked");
  const q = params.toString();
  return q ? `?${q}` : "";
}

function decideWa({ cookieOk, wholesale, search }) {
  if (wholesale) {
    const kept = preserveSearch(search);
    return "/atendimento" + (kept ? kept + "&blocked=wholesale" : "?blocked=wholesale");
  }
  if (!cookieOk) {
    return "/atendimento" + preserveSearch(search);
  }
  return "ROUTE";
}

describe("GET /wa hard gate", () => {
  it("sem cookie => /atendimento", () => {
    assert.equal(decideWa({ cookieOk: false, wholesale: false, search: "" }), "/atendimento");
  });

  it("src=como-chegar sem cookie => /atendimento?src=como-chegar", () => {
    assert.equal(
      decideWa({ cookieOk: false, wholesale: false, search: "?src=como-chegar" }),
      "/atendimento?src=como-chegar"
    );
  });

  it("utm_source=meta sem cookie preserva UTM", () => {
    const loc = decideWa({ cookieOk: false, wholesale: false, search: "?utm_source=meta&utm_medium=paid_social" });
    assert.equal(loc.startsWith("/atendimento?"), true);
    assert.match(loc, /utm_source=meta/);
    assert.match(loc, /utm_medium=paid_social/);
    assert.doesNotMatch(loc, /wa\.me/);
  });

  it("text=quero atacado => BLOQUEADO, nunca wa.me", () => {
    const loc = decideWa({
      cookieOk: false,
      wholesale: true,
      search: "?text=quero%20atacado",
    });
    assert.match(loc, /\/atendimento/);
    assert.match(loc, /blocked=wholesale/);
    assert.doesNotMatch(loc, /wa\.me/);
  });

  it("src=como-chegar com cookie válido => ROUTE A/B/C", () => {
    assert.equal(
      decideWa({ cookieOk: true, wholesale: false, search: "?src=como-chegar" }),
      "ROUTE"
    );
  });

  it("preserva src + UTMs + click ids", () => {
    const search =
      "?src=como-chegar&utm_source=meta&utm_medium=paid&utm_campaign=dia&utm_content=a&utm_term=t&fbclid=f&gclid=g&gbraid=gb&wbraid=wb";
    const kept = preserveSearch(search);
    for (const key of PRESERVE) {
      assert.match(kept, new RegExp(key + "="));
    }
  });

  it("src/referrer/como-chegar nunca são exceção", () => {
    for (const search of [
      "?src=como-chegar",
      "?src=footer",
      "?src=concierge",
      "?utm_campaign=como-chegar",
    ]) {
      const loc = decideWa({ cookieOk: false, wholesale: false, search });
      assert.equal(loc.startsWith("/atendimento"), true, search);
      assert.doesNotMatch(loc, /wa\.me/);
    }
  });
});
