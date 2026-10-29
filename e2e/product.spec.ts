import { test, expect } from '@playwright/test';

test('Produto carrega, seleciona tamanho e adiciona ao carrinho', async ({ page }) => {
  await page.goto('/produto/camiseta-nike-sportswear-preta');
  await expect(page.getByRole('heading', { name: 'Camiseta Nike Sportswear Preta' })).toBeVisible();

  // Botão de adicionar ao carrinho começa desabilitado até escolher o tamanho
  const addButton = page.getByRole('button', { name: 'Adicionar ao carrinho' });
  await expect(addButton).toBeDisabled();

  await page.getByRole('button', { name: 'Tamanho P' }).click();
  await expect(addButton).toBeEnabled();
  await addButton.click();

  // Drawer do carrinho abre com o item
  await expect(page.getByText('Seu carrinho')).toBeVisible();
  await expect(page.getByText('Camiseta Nike Sportswear Preta')).toBeVisible();
});

test('Tamanho esgotado fica bloqueado', async ({ page }) => {
  await page.goto('/produto/camiseta-nike-sportswear-preta');
  const ggButton = page.getByRole('button', { name: /Tamanho GG/ });
  await expect(ggButton).toBeDisabled();
});
