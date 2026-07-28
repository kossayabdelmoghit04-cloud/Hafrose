import { describe, it, expect } from 'vitest';
import {
  stripHtml,
  sanitizeText,
  sanitizeEmail,
  sanitizeUrl,
  sanitizeNumber,
} from '../../utils/sanitizer';

describe('stripHtml', () => {
  it('escapes script tags', () => {
    const result = stripHtml('<script>alert("xss")</script>');
    expect(result).not.toContain('<script>');
    expect(result).toContain('&lt;');
  });

  it('escapes HTML entities', () => {
    expect(stripHtml('<b>Hello</b>')).toContain('&lt;b&gt;');
  });

  it('returns empty string for non-string input', () => {
    expect(stripHtml(null)).toBe('');
    expect(stripHtml(123)).toBe('');
  });
});

describe('sanitizeText', () => {
  it('trims whitespace', () => {
    expect(sanitizeText('  hello  ')).toBe('hello');
  });

  it('collapses multiple spaces', () => {
    expect(sanitizeText('hello   world')).toBe('hello world');
  });

  it('returns empty string for non-string', () => {
    expect(sanitizeText(null)).toBe('');
  });
});

describe('sanitizeEmail', () => {
  it('returns lowercase trimmed valid email', () => {
    expect(sanitizeEmail(' Test@EXAMPLE.COM ')).toBe('test@example.com');
  });

  it('returns null for invalid email', () => {
    expect(sanitizeEmail('not-an-email')).toBeNull();
    expect(sanitizeEmail('')).toBeNull();
    expect(sanitizeEmail(null)).toBeNull();
  });
});

describe('sanitizeUrl', () => {
  it('allows https URLs', () => {
    const url = 'https://hafrose.com/shop';
    expect(sanitizeUrl(url)).toBe(url);
  });

  it('allows http URLs', () => {
    const url = 'http://localhost:8000';
    expect(sanitizeUrl(url)).toBeTruthy();
  });

  it('rejects javascript: protocol', () => {
    expect(sanitizeUrl('javascript:alert(1)')).toBeNull();
  });

  it('rejects invalid URLs', () => {
    expect(sanitizeUrl('not-a-url')).toBeNull();
    expect(sanitizeUrl(null)).toBeNull();
  });
});

describe('sanitizeNumber', () => {
  it('returns a valid number', () => {
    expect(sanitizeNumber('42')).toBe(42);
    expect(sanitizeNumber(3.14)).toBe(3.14);
  });

  it('returns null for NaN', () => {
    expect(sanitizeNumber('abc')).toBeNull();
  });

  it('respects min boundary', () => {
    expect(sanitizeNumber(1, { min: 5 })).toBeNull();
    expect(sanitizeNumber(5, { min: 5 })).toBe(5);
  });

  it('respects max boundary', () => {
    expect(sanitizeNumber(100, { max: 50 })).toBeNull();
    expect(sanitizeNumber(50, { max: 50 })).toBe(50);
  });
});
