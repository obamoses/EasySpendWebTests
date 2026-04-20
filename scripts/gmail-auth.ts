
import { google }  from 'googleapis';
import * as fs     from 'fs';
import * as path   from 'path';
import * as http   from 'http';
import * as url    from 'url';

const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');
const TOKEN_PATH        = path.join(process.cwd(), 'token.json');
const SCOPES            = ['https://www.googleapis.com/auth/gmail.readonly'];

async function main() {
  const { installed } = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf-8'));
  const oAuth2 = new google.auth.OAuth2(
    installed.client_id,
    installed.client_secret,
    'http://localhost:3333',
  );

  const authUrl = oAuth2.generateAuthUrl({ access_type: 'offline', scope: SCOPES });
  console.log('\nOpen this URL in your browser to authorise Gmail access:\n');
  console.log(authUrl);
  console.log('\nWaiting for Google to redirect back...');

  // Spin up a temporary localhost server to catch the OAuth callback
  const code = await new Promise<string>((resolve, reject) => {
    const server = http.createServer((req, res) => {
      const params = new url.URL(req.url!, 'http://localhost:3333').searchParams;
      const code   = params.get('code');
      res.end('<h2>Authorised! You can close this tab.</h2>');
      server.close();
      code ? resolve(code) : reject(new Error('No code in callback'));
    });
    server.listen(3333);
  });

  const { tokens } = await oAuth2.getToken(code);
  fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens, null, 2));
  console.log('\ntoken.json saved — you can now run the tests.\n');
}

main().catch(err => { console.error(err); process.exit(1); });
