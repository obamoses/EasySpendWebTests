import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class PinPage extends BasePage {

 
  readonly pinInputs: Locator[];
  readonly verifyButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.pinInputs = [
      page.locator('input[name="otp1"]'),
      page.locator('input[name="otp2"]'),
      page.locator('input[name="otp3"]'),
      page.locator('input[name="otp4"]'),
    ];
    this.verifyButton = page.getByRole('button', { name: 'Verify Pin' });
    this.errorMessage = page.getByRole('alert');
  }

  /** Fill all 4 PIN boxes one digit at a time */
  async enterPin(pin: string) {
    const digits = pin.replace(/\s/g, '').split('');

    if (digits.length !== 4) {
      throw new Error(`PIN must be 4 digits — received ${digits.length}`);
    }

    for (let i = 0; i < 4; i++) {
      await this.pinInputs[i].waitFor({ state: 'visible' });
      await this.pinInputs[i].fill(digits[i]);
    }
  }

  /** Wait for button to become enabled then click */
  async submitPin() {
    await expect(this.verifyButton).toBeEnabled({ timeout: 10000 });
    await this.clickElement(this.verifyButton);
  }

  /** Fill all boxes and submit in one call */
  async enterPinAndSubmit(pin: string) {
    await this.enterPin(pin);
    await this.submitPin();
  }

 
  async expectPinPage() {
    await this.expectElementVisible(this.pinInputs[0]);
    await this.expectElementVisible(this.verifyButton);
  }

  async expectErrorMessage(message: string) {
    await this.expectElementVisible(this.errorMessage);
    await this.expectElementText(this.errorMessage, message);
  }

  async expectPinSuccess() {
    await expect(this.page).not.toHaveURL(/pin/);
  }
}