import { test as setup } from '@playwright/test';
import { LoginPage }     from '../pages/LoginPage';
import { OtpPage }       from '../pages/OtpPage';
import { PinPage }       from '../pages/PinPage';
import { DashboardPage } from '../pages/DashboardPage';
import { users }         from '../data/users';
import {
  getLatestOtpMessageId,
  getOtpFromGmail,
} from '../utils/GmailHelper';

const authFile = 'playwright/.auth/user.json';

setup('authenticate', async ({ page }) => {
  setup.setTimeout(120_000);

  // Step 1 — Snapshot latest OTP message ID before triggering login
  const previousMessageId = await getLatestOtpMessageId();

  // Step 2 — Login
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login(users.valid.email, users.valid.password);

  // Step 3 — OTP (fetched live from Gmail via API)
  const otpPage = new OtpPage(page);
  await otpPage.expectOtpPage();
  const otp = await getOtpFromGmail(previousMessageId);
  await otpPage.enterOtpAndSubmit(otp);

  // Step 4 — PIN
  const pinPage = new PinPage(page);
  await pinPage.expectPinPage();
  await pinPage.enterPinAndSubmit(users.valid.pin);

  // Step 5 — Confirm on dashboard
  const dashboardPage = new DashboardPage(page);
  await dashboardPage.expectOnDashboard();

  // Step 6 — Save the logged-in browser state
  await page.context().storageState({ path: authFile });
});
