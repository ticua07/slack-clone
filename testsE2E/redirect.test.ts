import { test, expect } from '@playwright/test';

test("Redirect / on onauthorized users", async ({ page, baseURL }) => {
  const res = await page.goto("/")
  await page.goto('/');

  expect(page.url()).toBe(`${baseURL}/login`)
})

test("Redirect /profile on onauthorized users", async ({ page, baseURL }) => {
  const res = await page.goto("/")
  await page.goto('/profile');

  expect(page.url()).toBe(`${baseURL}/login`)
})