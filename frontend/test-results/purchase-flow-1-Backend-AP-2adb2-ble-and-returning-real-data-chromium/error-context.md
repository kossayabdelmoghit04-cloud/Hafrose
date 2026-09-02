# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: purchase-flow.spec.ts >> 1. Backend API is reachable and returning real data
- Location: e2e\purchase-flow.spec.ts:26:1

# Error details

```
Error: apiRequestContext.get: connect ECONNREFUSED ::1:8000
Call log:
  - → GET http://localhost:8000/api/categories
    - user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.7922.34 Safari/537.36
    - accept: */*
    - accept-encoding: gzip,deflate,br

```