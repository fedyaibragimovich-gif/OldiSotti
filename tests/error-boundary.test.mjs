import { test } from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { ErrorBoundary } from '../src/components/ErrorBoundary.tsx';

test('ErrorBoundary renders children normally when there is no error', () => {
  const html = renderToString(
    React.createElement(
      ErrorBoundary,
      null,
      React.createElement('div', { id: 'test-app' }, 'OldiSotti Market Active')
    )
  );

  assert.ok(html.includes('OldiSotti Market Active'));
  assert.ok(!html.includes('error-boundary-retry-button'));
});

test('ErrorBoundary.getDerivedStateFromError captures error object', () => {
  const sampleError = new Error('Test rendering crash in child component');
  const derivedState = ErrorBoundary.getDerivedStateFromError(sampleError);

  assert.equal(derivedState.hasError, true);
  assert.equal(derivedState.error?.message, 'Test rendering crash in child component');
});

test('ErrorBoundary displays user-friendly fallback and retry button when in error state', () => {
  const boundary = new ErrorBoundary({});
  boundary.state = {
    hasError: true,
    error: new Error('Simulated database sync failure'),
    errorInfo: null
  };

  const rendered = boundary.render();
  const html = renderToString(rendered);

  // Must contain user-friendly title and guidance
  assert.ok(html.includes('Kutilmagan xatolik yuz berdi'));
  assert.ok(html.includes('error-boundary-card'));
  assert.ok(html.includes('error-boundary-retry-button'));
  assert.ok(html.includes('Qayta urinish / Try Again'));
  assert.ok(html.includes('Simulated database sync failure'));
});

test('ErrorBoundary handleReset clears error state and triggers onReset callback', () => {
  let resetCalled = false;
  const boundary = new ErrorBoundary({
    onReset: () => {
      resetCalled = true;
    }
  });

  boundary.state = {
    hasError: true,
    error: new Error('Temporary UI failure'),
    errorInfo: null
  };

  // Mock setState
  boundary.setState = (nextState) => {
    Object.assign(boundary.state, nextState);
  };

  // Call private handleReset
  boundary.handleReset();

  assert.equal(resetCalled, true);
  assert.equal(boundary.state.hasError, false);
  assert.equal(boundary.state.error, null);
});
