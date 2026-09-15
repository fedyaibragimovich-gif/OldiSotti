import { test } from 'node:test';
import assert from 'node:assert/strict';
import { findFallbackAnswer } from '../src/lib/supportKnowledge.ts';

test('matches question about posting an ad in multiple languages', () => {
  const qUz = "Salom, qanday qilib e'lon berish mumkin";
  const ansUz = findFallbackAnswer(qUz, 'uz');
  assert.ok(ansUz);
  assert.match(ansUz, /e’lon berish/i);

  const qRu = "как подать объявление?";
  const ansRu = findFallbackAnswer(qRu, 'ru');
  assert.ok(ansRu);
  assert.match(ansRu, /подать объявление/i);
});

test('matches questions about auth, moderation, chat and safety', () => {
  assert.match(findFallbackAnswer('Google orqali kira olmayapman', 'uz'), /Google bilan davom etish/i);
  assert.match(findFallbackAnswer('Elonim tekshiruvda turibdi', 'uz'), /Tekshiruvda/i);
  assert.match(findFallbackAnswer('Sotuvchiga qanday yozaman?', 'uz'), /Sotuvchiga yozish/i);
  assert.match(findFallbackAnswer('Firibgarlardan qanday saqlanish kerak?', 'uz'), /xavfsizlik qoidalari/i);
});

test('simple greeting returns welcome message with prompt suggestions', () => {
  const greeting = findFallbackAnswer('Salom', 'uz');
  assert.ok(greeting);
  assert.match(greeting, /Assalomu alaykum/i);
});

test('returns null for completely unrelated queries', () => {
  assert.equal(findFallbackAnswer('qaysi kino yaxshi?', 'uz'), null);
});
