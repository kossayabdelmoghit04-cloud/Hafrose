# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: cart_pricing_and_pagination.spec.ts >> P0 Validations: Cart Pricing & Pagination Contract >> FNT-01 & API-01: Public Products API returns direct array and cart computes effective price correctly
- Location: e2e\cart_pricing_and_pagination.spec.ts:17:3

# Error details

```
Error: apiRequestContext.get: connect ECONNREFUSED ::1:8000
Call log:
  - → GET http://localhost:8000/api/products?per_page=6
    - user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.7922.34 Safari/537.36
    - accept: */*
    - accept-encoding: gzip,deflate,br

```