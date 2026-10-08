type XmlNode = { name: string; text: string; children: XmlNode[] };

export type LinxStock = {
  status: "available" | "out_of_stock" | "not_found";
  scope: "sku" | "reference";
  quantity: number;
  skuCount: number;
};

type LinxConfig = {
  endpoint: string;
  user: string;
  password: string;
  key: string;
  cnpj: string;
  portal: string;
  deposito?: string;
};

type LinxFailureCode = "request_timeout" | "request_failed" | "http_error" | "empty_response" | "linx_response_error";

class LinxStockError extends Error {
  constructor(readonly code: LinxFailureCode, readonly method: string, readonly httpStatus?: number) {
    super(code);
    this.name = "LinxStockError";
  }
}

/** Safe for server logs: never includes the endpoint, credentials, XML or customer data. */
export function linxStockDiagnostic(error: unknown): { code: string; method?: string; httpStatus?: number } {
  return error instanceof LinxStockError
    ? { code: error.code, method: error.method, ...(error.httpStatus ? { httpStatus: error.httpStatus } : {}) }
    : { code: error instanceof Error && error.message === "linx_not_configured" ? "linx_not_configured" : "unexpected_error" };
}

function env(name: string): string { return String(process.env[name] || "").trim(); }

function getConfig(): LinxConfig | null {
  const endpoint = env("LINX_B2C_ENDPOINT");
  const user = env("LINX_B2C_USER");
  const password = env("LINX_B2C_PASSWORD");
  const key = env("LINX_B2C_KEY");
  const cnpj = env("LINX_B2C_CNPJ").replace(/\D/g, "");
  const portal = env("LINX_B2C_PORTAL");
  if (!endpoint || !user || !password || !key || cnpj.length !== 14 || !/^\d+$/.test(portal)) return null;
  return { endpoint, user, password, key, cnpj, portal, deposito: env("LINX_B2C_DEPOSITO") || undefined };
}

function escapeXml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}

function xmlName(name: string): string { return name.toLowerCase().split(":").at(-1) || ""; }

function parseXml(xml: string): XmlNode {
  const root: XmlNode = { name: "root", text: "", children: [] };
  const stack = [root];
  for (const token of xml.match(/<!--[\s\S]*?-->|<[^>]+>|[^<]+/g) || []) {
    if (token.startsWith("<!--") || token.startsWith("<?") || token.startsWith("<!")) continue;
    if (token.startsWith("</")) { if (stack.length > 1) stack.pop(); continue; }
    if (token.startsWith("<")) {
      const match = token.match(/^<\s*([^\s/>]+)/);
      if (!match) continue;
      const node: XmlNode = { name: xmlName(match[1]), text: "", children: [] };
      stack.at(-1)?.children.push(node);
      if (!token.endsWith("/>")) stack.push(node);
      continue;
    }
    stack.at(-1)!.text += token.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&apos;/g, "'");
  }
  return root;
}

function directFields(node: XmlNode): Record<string, string> {
  const fields: Record<string, string> = {};
  for (const child of node.children) {
    const text = child.text.trim();
    if (text) fields[child.name] = text;
  }
  return fields;
}

function everyNode(node: XmlNode, result: XmlNode[] = []): XmlNode[] {
  result.push(node);
  for (const child of node.children) everyNode(child, result);
  return result;
}

function numberValue(value: string | undefined): number | null {
  if (!value) return null;
  const raw = value.trim();
  const normalized = raw.includes(",") && raw.includes(".")
    ? raw.replace(/\./g, "").replace(",", ".")
    : raw.replace(",", ".");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function productSkus(xml: string): string[] {
  const values = everyNode(parseXml(xml)).map(directFields).map((fields) => fields.codigoproduto).filter((value): value is string => /^\d{1,20}$/.test(value || ""));
  return Array.from(new Set(values));
}

function linxResponseFailed(xml: string): boolean {
  return everyNode(parseXml(xml)).some((node) => {
    const value = node.text.trim().toLowerCase();
    if (node.name === "responsesuccess") return value === "false" || value === "0";
    if (node.name === "responseerror") return value !== "" && value !== "false" && value !== "0";
    return false;
  });
}

function stockRows(xml: string): Array<{ sku: string; saldo: number }> {
  return everyNode(parseXml(xml)).map(directFields).flatMap((fields) => {
    const saldo = numberValue(fields.saldo);
    return /^\d{1,20}$/.test(fields.codigoproduto || "") && saldo !== null ? [{ sku: fields.codigoproduto, saldo }] : [];
  });
}

function requestXml(config: LinxConfig, method: string, parameters: Record<string, string>): string {
  const parameterXml = Object.entries({ chave: config.key, cnpjEmp: config.cnpj, ...parameters })
    .map(([id, value]) => `<Parameter id="${escapeXml(id)}">${escapeXml(value)}</Parameter>`).join("");
  return `<?xml version="1.0" encoding="utf-8"?><LinxMicrovix><Authentication user="${escapeXml(config.user)}" password="${escapeXml(config.password)}"/><ResponseFormat>xml</ResponseFormat><IdPortal>${escapeXml(config.portal)}</IdPortal><Command><Name>${escapeXml(method)}</Name><Parameters>${parameterXml}</Parameters></Command></LinxMicrovix>`;
}

async function callLinx(config: LinxConfig, method: string, parameters: Record<string, string>): Promise<string> {
  let response: Response;
  try {
    response = await fetch(config.endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/xml; charset=utf-8", Accept: "application/xml, text/xml" },
      body: requestXml(config, method, parameters),
      cache: "no-store",
      signal: AbortSignal.timeout(8_000),
    });
  } catch (error) {
    throw new LinxStockError(error instanceof Error && error.name === "TimeoutError" ? "request_timeout" : "request_failed", method);
  }
  const body = await response.text();
  if (!response.ok) throw new LinxStockError("http_error", method, response.status);
  if (!body.trim()) throw new LinxStockError("empty_response", method);
  if (linxResponseFailed(body)) throw new LinxStockError("linx_response_error", method);
  return body;
}

async function stockForSku(config: LinxConfig, sku: string): Promise<Array<{ sku: string; saldo: number }>> {
  const response = await callLinx(config, "B2CConsultaProdutosDetalhesDepositos", {
    codigoproduto: sku,
    timestamp: "0",
    ...(config.deposito ? { deposito: config.deposito } : {}),
  });
  return stockRows(response).filter((row) => row.sku === sku);
}

export function hasLinxStockConfig(): boolean { return getConfig() !== null; }

/** Resolve an internal Linx reference to the sellable product SKUs it owns. */
export async function getLinxSkusForReference(reference: string): Promise<string[]> {
  const config = getConfig();
  if (!config) throw new Error("linx_not_configured");
  const normalized = String(reference || "").trim();
  if (!normalized) return [];
  const products = await callLinx(config, "B2CConsultaProdutos", { referencia: normalized, timestamp: "0" });
  return productSkus(products);
}

export async function isLinxSkuForReference(input: { sku: string; reference: string }): Promise<boolean> {
  const sku = String(input.sku || "").trim();
  if (!/^\d{1,20}$/.test(sku)) return false;
  return (await getLinxSkusForReference(input.reference)).includes(sku);
}

export async function getLinxStock(input: { sku?: string; reference?: string }): Promise<LinxStock> {
  const config = getConfig();
  if (!config) throw new Error("linx_not_configured");
  const sku = String(input.sku || "").trim();
  const reference = String(input.reference || "").trim();
  let skus: string[];
  let scope: LinxStock["scope"];
  if (sku) { skus = [sku]; scope = "sku"; }
  else {
    skus = await getLinxSkusForReference(reference);
    scope = "reference";
  }
  if (!skus.length) return { status: "not_found", scope, quantity: 0, skuCount: 0 };
  const rows = (await Promise.all(skus.slice(0, 100).map((item) => stockForSku(config, item)))).flat();
  const quantity = rows.reduce((total, row) => total + Math.max(0, row.saldo), 0);
  return { status: quantity > 0 ? "available" : "out_of_stock", scope, quantity, skuCount: skus.length };
}
