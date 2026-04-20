import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class DashboardPage extends BasePage {


  readonly cryptoWalletButton: Locator;


  readonly modalTitle:    Locator;
  readonly modalCloseBtn: Locator;
  readonly sellCryptoRow: Locator;
  readonly buyCryptoRow:  Locator;

  readonly cryptoFundingTitle: Locator;
  readonly usdtCoin:           Locator;

  readonly alertModal:        Locator;
  readonly alertModalDismiss: Locator;

  constructor(page: Page) {
    super(page);

   
    this.cryptoWalletButton = page.locator('li.sidebar-crypto-wallet button');

    
    this.modalTitle    = page.locator('h1.text-black.text-xl.font-semibold');
    this.modalCloseBtn = page.locator('button.p-2.hover\\:bg-gray-100.rounded-full');
    this.sellCryptoRow = page.locator('h3.text-black.font-medium.text-base', { hasText: 'Sell Crypto' });
    this.buyCryptoRow  = page.locator('h3.text-black.font-medium.text-base', { hasText: 'Buy Crypto' });


    this.cryptoFundingTitle = page.locator('h2.text-2xl.font-bold.text-gray-900');
    this.usdtCoin           = page.getByText('USDT', { exact: true }).first();

    this.alertModal        = page.locator('[role="dialog"], .modal, [data-modal]').first();
    this.alertModalDismiss = page.locator('button:has-text("Dismiss"), button:has-text("Close"), button:has-text("OK"), button:has-text("Got it")').first();
  }



  async dismissAlertModalIfPresent() {
    try {
      await this.alertModalDismiss.waitFor({ state: 'visible', timeout: 3000 });
      await this.alertModalDismiss.click();
    } catch {
      // No blocking modal present — continue
    }
  }

  async openCryptoWallet() {
    await this.cryptoWalletButton.waitFor({ state: 'visible' });
    await this.cryptoWalletButton.click();
    await this.modalTitle.waitFor({ state: 'visible', timeout: 10000 });
  }

  async clickSellCrypto() {
    await this.sellCryptoRow.waitFor({ state: 'visible' });
    await this.sellCryptoRow.click();
  }

  async selectUSDT() {
    await this.usdtCoin.waitFor({ state: 'visible', timeout: 10000 });
    await this.usdtCoin.click();
  }

  /** Clicks Buy Crypto — opens WhatsApp in a new tab and returns it */
  async clickBuyCrypto(): Promise<Page> {
    await this.buyCryptoRow.waitFor({ state: 'visible' });

    const [newTab] = await Promise.all([
      this.page.context().waitForEvent('page'),
      this.buyCryptoRow.click(),
    ]);

    await newTab.waitForLoadState('domcontentloaded');
    return newTab;
  }

  async closeCryptoModal() {
    await this.modalCloseBtn.waitFor({ state: 'visible' });
    await this.modalCloseBtn.click();
    await this.modalTitle.waitFor({ state: 'hidden', timeout: 10000 });
  }

  

  async expectOnDashboard() {
    await expect(this.page).toHaveURL(/\/dashboard/, { timeout: 15_000 });
  }

  async expectCryptoModalVisible() {
    await expect(this.modalTitle).toBeVisible({ timeout: 10000 });
    await expect(this.modalTitle).toHaveText('Crypto Wallet');
  }

  async expectCryptoModalHidden() {
    await expect(this.modalTitle).toBeHidden({ timeout: 10000 });
  }

  async expectBothOptionsVisible() {
    await expect(this.sellCryptoRow).toBeVisible();
    await expect(this.buyCryptoRow).toBeVisible();
  }

  async expectCryptoFundingVisible() {
    await expect(this.cryptoFundingTitle).toBeVisible({ timeout: 10000 });
    await expect(this.cryptoFundingTitle).toHaveText('Crypto Funding');
  }

  async expectUSDTVisible() {
    await expect(this.usdtCoin).toBeVisible({ timeout: 10000 });
  }

  /** Asserts the new tab redirected to the correct WhatsApp URL */
  async expectWhatsAppRedirect(newTab: Page) {
    await expect(newTab).toHaveURL(
      /api\.whatsapp\.com\/send/,
      { timeout: 15000 }
    );
  }
}