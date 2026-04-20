import { test, expect } from '@playwright/test';
import { DashboardPage } from '../../pages/DashboardPage';

test.describe.configure({ mode: 'serial' });

test.describe('Dashboard — Crypto Wallet', () => {
  let dashboard: DashboardPage;

  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard/home');
    dashboard = new DashboardPage(page);
    await dashboard.dismissAlertModalIfPresent();
  });

  test('should open crypto wallet modal from sidebar', async () => {
    await dashboard.openCryptoWallet();
    await dashboard.expectCryptoModalVisible();
    await dashboard.expectBothOptionsVisible();
  });

  test('should show crypto funding section after clicking sell crypto', async () => {
    await dashboard.openCryptoWallet();
    await dashboard.clickSellCrypto();
    await dashboard.expectCryptoFundingVisible();
  });

  test('should display USDT coin in crypto funding', async () => {
    await dashboard.openCryptoWallet();
    await dashboard.clickSellCrypto();
    await dashboard.expectCryptoFundingVisible();
    await dashboard.expectUSDTVisible();
  });

  test('should select USDT coin successfully', async () => {
    await dashboard.openCryptoWallet();
    await dashboard.clickSellCrypto();
    await dashboard.expectCryptoFundingVisible();
    await dashboard.selectUSDT();
  });

  test('should redirect to WhatsApp when buy crypto is clicked', async () => {
    await dashboard.openCryptoWallet();
    const whatsAppTab = await dashboard.clickBuyCrypto();
    await dashboard.expectWhatsAppRedirect(whatsAppTab);
  });

  test('should close crypto wallet modal', async () => {
    await dashboard.openCryptoWallet();
    await dashboard.expectCryptoModalVisible();
    await dashboard.closeCryptoModal();
    await dashboard.expectCryptoModalHidden();
  });

});