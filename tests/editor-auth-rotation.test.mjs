import assert from 'node:assert/strict';
import { webcrypto } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { test } from 'node:test';
import vm from 'node:vm';

const require = createRequire(import.meta.url);
const ts = require('typescript');
const exports = {};
const env = {
  VALUTIN_EDITOR_PASSWORD: 'senha-original-123',
  VALUTIN_EDITOR_SECRET: 'segredo-de-teste-com-mais-de-32-caracteres',
  DASHBOARD_PASSWORD: 'senha-diferente-do-painel',
  NODE_ENV: 'production',
};
const source = readFileSync(new URL('../app/lib/editor/auth.ts', import.meta.url), 'utf8');
vm.runInNewContext(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, {
  exports,
  crypto: webcrypto,
  TextEncoder,
  process: { env },
  Date,
});

test('editor password rotation invalidates previous sessions without changing the session secret', async () => {
  const oldSession = await exports.signEditorSession();
  assert.equal(await exports.verifyEditorSession(oldSession), true);

  env.VALUTIN_EDITOR_PASSWORD = 'senha-nova-de-teste-123';
  assert.equal(await exports.verifyEditorSession(oldSession), false);

  const newSession = await exports.signEditorSession();
  assert.equal(await exports.verifyEditorSession(newSession), true);
});
