import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {

  readonly emailInput:    Locator;
  readonly passwordInput: Locator;
  readonly continueToDashboardButton:  Locator;
  readonly errorMessage:  Locator;

  constructor(page: Page) {
    super(page);
    this.emailInput    = page.locator('input[name="email"]');
    this.passwordInput = page.locator('input[name="password"]');
    this.continueToDashboardButton  = page.getByRole('button', { name: 'Continue to Dashboard' });
    this.errorMessage  = page.locator('[role="alert"]').filter({ hasText: /.+/ });
  }

  
  async goto() {
    await super.goto('/auth/signin');
  }

  async login(email: string, password: string) {
    await this.fillField(this.emailInput, email);
    await this.fillField(this.passwordInput, password);
    await this.clickElement(this.continueToDashboardButton);
  }

  
  async expectLoginPage() {
    await this.expectURL('/signin');
    await this.expectElementVisible(this.continueToDashboardButton);
  }

  async expectErrorMessage(message: string) {
    // The app shows login errors as a brief toast — search for the text directly
    // with a generous timeout so slow server responses are still caught.
    await this.page.getByText(message, { exact: false }).waitFor({
      state: 'visible',
      timeout: 15_000,
    });
  }

  async expectLoginSuccess() {
    await expect(this.page).not.toHaveURL(/signin/);
  }
}