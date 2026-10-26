const fs = require('node:fs');
const ts = require('typescript');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const source = fs.readFileSync(require('node:path').join(__dirname, '../src/app/services/admin-auth.interceptor.ts'), 'utf8');
const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const exportsObject = {};
vm.runInNewContext(code, { exports: exportsObject, URL, window: { location: { origin: 'https://ez-trucks.com' } },
  require: name => name === '@angular/core' ? { inject: () => ({ getToken: () => 'private-session' }) } : name.includes('api.config') ? { API_BASE_URL: 'https://api.example.invalid/api' } : { AdminAuth: class {} } });
for (const url of ['https://api.example.invalid/api/parts', 'https://api.example.invalid/api/admin/ad-drafts']) {
  const result = exportsObject.adminAuthInterceptor({ url, clone: value => value }, value => value);
  assert.equal(result.setHeaders.Authorization, 'Bearer private-session');
}
for (const url of ['https://other.invalid/api/parts', 'https://api.example.invalid/apievil/parts', 'https://api.example.invalid.evil.invalid/api/parts']) {
  const req = { url, clone: () => assert.fail('Token attached to unrelated URL') };
  assert.equal(exportsObject.adminAuthInterceptor(req, value => value), req);
}
console.log('PASS: API requests receive the token; unrelated origins and path prefixes do not.');
