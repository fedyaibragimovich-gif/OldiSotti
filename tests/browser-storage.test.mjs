import { test } from 'node:test';
import assert from 'node:assert/strict';
import { browserStorage, readStoredIds } from '../src/lib/browserStorage.ts';

test('restricted browser storage does not break preference access', () => {
  globalThis.window = { get localStorage() { throw new Error('SecurityError'); } };
  assert.equal(browserStorage.getItem('olx_lang'), null);
  assert.doesNotThrow(() => browserStorage.setItem('olx_lang', 'uz'));
  assert.doesNotThrow(() => browserStorage.removeItem('olx_lang'));
  assert.deepEqual(readStoredIds('olx_favorites'), []);
});

test('legacy marketplace keys migrate to the OldiSotdi namespace', () => {
  const values = new Map([
    ['olx_lang', 'ru'],
    ['oldisotti_currency', 'USD'],
  ]);
  globalThis.window = {
    localStorage: {
      getItem: (key) => values.has(key) ? values.get(key) : null,
      setItem: (key, value) => values.set(key, value),
      removeItem: (key) => values.delete(key),
    }
  };

  assert.equal(browserStorage.getItem('olx_lang'), 'ru');
  assert.equal(values.get('oldisotdi_lang'), 'ru');
  assert.equal(values.has('olx_lang'), false);

  assert.equal(browserStorage.getItem('oldisotti_currency'), 'USD');
  assert.equal(values.get('oldisotdi_currency'), 'USD');
  assert.equal(values.has('oldisotti_currency'), false);

  browserStorage.setItem('olx_dark_mode', 'true');
  assert.equal(values.get('oldisotdi_dark_mode'), 'true');
  assert.equal(values.has('olx_dark_mode'), false);
});

test('invalid persisted favorites recover; valid IDs retain their order', () => {
  let raw;
  globalThis.window = { localStorage: { getItem: () => raw } };
  for (raw of ['null', '{}', '42', 'broken']) assert.deepEqual(readStoredIds('favorites'), []);
  raw = '["a",null,2,"b","a",""]';
  assert.deepEqual(readStoredIds('favorites'), ['a', 'b']);
});

test('full storage does not interrupt UI actions', () => {
  globalThis.window = { localStorage: {
    getItem: () => 'ru',
    setItem: () => { throw new Error('QuotaExceededError'); },
    removeItem: () => {},
  } };
  assert.equal(browserStorage.getItem('olx_lang'), 'ru');
  assert.doesNotThrow(() => browserStorage.setItem('olx_favorites', '["a"]'));
});
