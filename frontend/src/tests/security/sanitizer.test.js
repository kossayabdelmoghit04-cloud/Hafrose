import { describe, it, expect } from 'vitest';
import { sanitizer, escapeHtml, sanitizeString, sanitizeJsonLd } from '../../utils/sanitizer';

describe('Sanitizer Utility (Phase 6.5 Security Hardening)', () => {
  it('escapes HTML special characters correctly', () => {
    const raw = '<script>alert("XSS & test")</script>';
    const escaped = escapeHtml(raw);
    expect(escaped).not.toContain('<script>');
    expect(escaped).toContain('&lt;script&gt;');
    expect(escaped).toContain('&amp;');
  });

  it('strips script tags and javascript pseudo-protocols', () => {
    const dangerous = '<script>alert(1)</script>Safe Text';
    const clean = sanitizeString(dangerous);
    expect(clean).not.toContain('<script>');
    expect(clean).toContain('Safe Text');
  });

  it('sanitizes JSON-LD script objects to prevent breakout XSS', () => {
    const schema = { name: '</script><script>alert("XSS")</script>' };
    const jsonLd = sanitizeJsonLd(schema);
    expect(jsonLd).not.toContain('</script>');
    expect(jsonLd).toContain('\\u003c/script\\u003e');
  });
});
