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
  DASHBOARD_PASSWORD: 'senha-original-painel-123',
  DASHBOARD_SECRET: 'segredo-independente-do-painel-123456',
  NODE_ENV: 'production',
};
const source = readFileSync(new URL('../app/lib/dashboard/auth.ts', import.meta.url), 'utf8');
vm.runInNewContext(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, {
  exports,
  crypto: webcrypto,
  TextEncoder,
  process: { env },
  Date,
});

test('dashboard password rotation invalidates previous sessions even with a separate signing secret', async () => {
  const oldSession = await exports.signSession();
  assert.equal(await exports.verifySession(oldSession), true);

  env.DASHBOARD_PASSWORD = 'senha-nova-painel-456';
  assert.equal(await exports.verifySession(oldSession), false);

  const newSession = await exports.signSession();
  assert.equal(await exports.verifySession(newSession), true);
  assert.equal(exports.checkPassword('senha-nova-painel-456'), true);
  assert.equal(exports.checkPassword('senha-original-painel-123'), false);
});
