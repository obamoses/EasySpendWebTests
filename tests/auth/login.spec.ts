import { test, expect }           from '@playwright/test';
import { LoginPage }               from '../../pages/LoginPage';
import { OtpPage }                 from '../../pages/OtpPage';
import { PinPage }                 from '../../pages/PinPage';
import { users }                   from '../../data/users';
import {
  getLatestOtpMessageId,
  getOtpFromGmail,
} from '../../utils/GmailHelper';

test.describe('Login Flow', () => {

  test('should login successfully with valid credentials', async ({ page }) => {
    test.setTimeout(120_000);

    // Snapshot the current latest OTP email ID so we only use the
    // fresh one sent by this login attempt.
    const previousMessageId = await getLatestOtpMessageId();

    // Login
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.expectLoginPage();
    await loginPage.login(users.valid.email, users.valid.password);

    // OTP (fetched live from Gmail via API)
    const otpPage = new OtpPage(page);
    await otpPage.expectOtpPage();
    const otp = await getOtpFromGmail(previousMessageId);
    await otpPage.enterOtpAndSubmit(otp);

    // PIN
    const pinPage = new PinPage(page);
    await pinPage.expectPinPage();
    await pinPage.enterPinAndSubmit(users.valid.pin);

  });

  test('should show error with invalid credentials', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    await loginPage.login(users.invalid.email, users.invalid.password);

    await expect(page).toHaveURL(/signin/);
  });

});
