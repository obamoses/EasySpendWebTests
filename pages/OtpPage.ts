import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class OtpPage extends BasePage {


  readonly otpInputs: Locator[];
  readonly verifyButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.otpInputs = [
      page.locator('input[name="otp1"]'),
      page.locator('input[name="otp2"]'),
      page.locator('input[name="otp3"]'),
      page.locator('input[name="otp4"]'),
      page.locator('input[name="otp5"]'),
      page.locator('input[name="otp6"]'),
    ];
    this.verifyButton = page.getByRole('button', { name: 'Verify OTP' });
    this.errorMessage = page.getByRole('alert');
  }

  /** Fill all 6 OTP boxes one digit at a time */
  async enterOtp(otp: string) {
    const digits = otp.replace(/\s/g, '').split('');

    if (digits.length !== 6) {
      throw new Error(`OTP must be 6 digits — received ${digits.length}`);
    }

    for (let i = 0; i < 6; i++) {
      await this.otpInputs[i].waitFor({ state: 'visible' });
      await this.otpInputs[i].fill(digits[i]);
    }
  }

  /** OTP form auto-submits after the 6th digit — wait for navigation to PIN page */
  async submitOtp() {
    await this.page.waitForURL('**/auth/signin/pin', { timeout: 30_000 });
    console.log('[otp] navigated to PIN page:', this.page.url());
  }

  /** Fill all boxes and submit in one call */
  async enterOtpAndSubmit(otp: string) {
    await this.enterOtp(otp);
    await this.submitOtp();
  }


  async expectOtpPage() {
    await expect(this.otpInputs[0]).toBeVisible({ timeout: 30_000 });
    await expect(this.verifyButton).toBeVisible({ timeout: 30_000 });
  }

  async expectErrorMessage(message: string) {
    await this.expectElementVisible(this.errorMessage);
    await this.expectElementText(this.errorMessage, message);
  }

  async expectOtpSuccess() {
    await expect(this.page).not.toHaveURL(/otp/);
  }
}