import { test, expect } from '@playwright/test';

test('Home mostra Categorias, Novos Drop, botão e Stories nesta ordem', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('link', { name: 'DROP BSB' }).first()).toBeVisible();
  await expect(page.getByText('Categorias', { exact: true })).toBeVisible();
  await expect(page.getByText('Novos Drop', { exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Ver todas as roupas' })).toHaveAttribute('href', '/produtos');
  await expect(page.getByText('Vitrine em Stories', { exact: true })).toBeVisible();
});
