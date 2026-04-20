import { Page, Locator, expect } from '@playwright/test';

export class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  //Navigation 
  async goto(path: string = '/') {
    await this.page.goto(path);
    await this.waitForPageLoad();
  }

  async goBack() {
    await this.page.goBack();
    await this.waitForPageLoad();
  }

  async waitForPageLoad() {
    await this.page.waitForLoadState('domcontentloaded');
  }

  async waitForNetworkIdle() {
    await this.page.waitForLoadState('networkidle');
  }

  async waitForElement(locator: Locator) {
    await locator.waitFor({ state: 'visible' });
  }

  
  async expectURL(urlPart: string) {
    await expect(this.page).toHaveURL(new RegExp(urlPart));
  }

  async expectTitle(title: string) {
    await expect(this.page).toHaveTitle(new RegExp(title));
  }

  async expectElementVisible(locator: Locator) {
    await expect(locator).toBeVisible();
  }

  async expectElementHidden(locator: Locator) {
    await expect(locator).toBeHidden();
  }

  async expectElementText(locator: Locator, text: string) {
    await expect(locator).toContainText(text);
  }

  async clickElement(locator: Locator) {
    await locator.waitFor({ state: 'visible' });
    await locator.click();
  }

  async fillField(locator: Locator, value: string) {
    await locator.waitFor({ state: 'visible' });
    await locator.clear();
    await locator.fill(value);
  }

  async selectDropdown(locator: Locator, value: string) {
    await locator.waitFor({ state: 'visible' });
    await locator.selectOption(value);
  }

  async screenshot(name: string) {
    await this.page.screenshot({
      path: `test-results/${name}-${Date.now()}.png`,
      fullPage: true,
    });
  }

  async scrollToElement(locator: Locator) {
    await locator.scrollIntoViewIfNeeded();
  }

  async getElementText(locator: Locator): Promise<string> {
    return (await locator.textContent()) ?? '';
  }

  async isElementVisible(locator: Locator): Promise<boolean> {
    return await locator.isVisible();
  }

  async dismissDialog() {
    this.page.on('dialog', dialog => dialog.dismiss());
  }

  async acceptDialog() {
    this.page.on('dialog', dialog => dialog.accept());
  }
}