export const users = {
  valid: {
    email:    process.env.USER_EMAIL    ?? '',
    password: process.env.USER_PASSWORD ?? '',
    otp:      process.env.USER_OTP      ?? '',
    pin:      process.env.USER_PIN      ?? '',
  },
  invalid: {
    email:    'obaodiwe3@gmail.com',
    password: 'Password1@',
  },
};