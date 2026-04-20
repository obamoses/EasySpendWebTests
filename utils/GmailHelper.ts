import { google, gmail_v1 } from 'googleapis';
import { OAuth2Client }     from 'google-auth-library';
import * as fs              from 'fs';
import * as path            from 'path';

const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');
const TOKEN_PATH        = path.join(process.cwd(), 'token.json');

//auth
function getOAuthClient(): OAuth2Client {
  const { installed } = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf-8'));
  const client = new google.auth.OAuth2(
    installed.client_id,
    installed.client_secret,
    installed.redirect_uris[0],
  );
  const token = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf-8'));
  client.setCredentials(token);
  return client;
}

function getGmail() {
  return google.gmail({ version: 'v1', auth: getOAuthClient() });
}

// ── body extraction 
function decodeBase64(data: string): string {
  return Buffer.from(data.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf-8');
}

function extractText(payload: gmail_v1.Schema$MessagePart | undefined): string {
  if (!payload) return '';


  if (payload.parts?.length) {
    for (const part of payload.parts) {
      const text = extractText(part);
      if (text) return text;
    }
  }

  // Single-part: prefer plain text, fall back to HTML
  if (payload.body?.data) {
    const raw = decodeBase64(payload.body.data);
    if (payload.mimeType === 'text/html') {
      // Strip HTML tags to get readable text
      return raw.replace(/<[^>]+>/g, ' ');
    }
    return raw;
  }

  return '';
}

// public API
const GMAIL_QUERY = 'from:noreply@easyspend.cc subject:OTP';

/**
 * Returns the Gmail message ID of the most recent EasySpend OTP email,
 * or null if none exist yet.
 *
 * Call this BEFORE triggering login so getOtpFromGmail can tell which
 * message is pre-existing.
 */
export async function getLatestOtpMessageId(): Promise<string | null> {
  const gmail = getGmail();
  const res = await gmail.users.messages.list({
    userId: 'me',
    q:       GMAIL_QUERY,
    maxResults: 1,
  });
  return res.data.messages?.[0]?.id ?? null;
}

/**
 * Polls Gmail every 5 seconds until a NEW OTP email arrives (one whose ID
 * differs from `previousMessageId`), then returns the 6-digit code inside it.
 *
 * @param previousMessageId  ID from getLatestOtpMessageId() captured before login
 * @param timeout            Max wait in ms (default 90 s)
 */
export async function getOtpFromGmail(
  previousMessageId: string | null,
  timeout = 90_000,
): Promise<string> {
  const gmail    = getGmail();
  const deadline = Date.now() + timeout;

  while (true) {
    const res = await gmail.users.messages.list({
      userId: 'me',
      q:       GMAIL_QUERY,
      maxResults: 1,
    });

    const latestId = res.data.messages?.[0]?.id ?? null;

    if (latestId && latestId !== previousMessageId) {
      const msg = await gmail.users.messages.get({
        userId: 'me',
        id:     latestId,
        format: 'FULL',
      });

      const text  = extractText(msg.data.payload);
      const match = text.match(/\b(\d{6})\b/);
      if (match) return match[1];
    }

    if (Date.now() > deadline) {
      throw new Error(
        `Timed out waiting for new OTP email ` +
        `(previous message ID: ${previousMessageId ?? 'none'})`,
      );
    }

    await new Promise<void>(r => setTimeout(r, 5_000));
  }
}
