const dotenv = require('dotenv');
dotenv.config();


const { google } = require('googleapis');

// ✅ MUST MATCH Google Cloud Console EXACTLY
// const REDIRECT_URI =
//   'http://localhost:3009/oauth2callback';

// const oauth2Client = new google.auth.OAuth2(
//   process.env.GOOGLE_CLIENT_ID,     // <-- move to env
//   process.env.GOOGLE_CLIENT_SECRET, // <-- move to env
//   REDIRECT_URI
// );

// const SCOPES = [
//   'https://www.googleapis.com/auth/drive',
//   'https://www.googleapis.com/auth/documents',
//   'https://www.googleapis.com/auth/spreadsheets',
//   'https://www.googleapis.com/auth/presentations'
// ];

// // ✅ prompt: 'consent' is REQUIRED
// const authUrl = oauth2Client.generateAuthUrl({
//   access_type: 'offline',
//   prompt: 'consent',
//   scope: SCOPES
// });

// console.log('Authorize this app by visiting this url:\n', authUrl);


const fetch = require('node-fetch')

async function getToken() {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code: '4/0AXlqoi4vpEGX38n-EhyAwtlfM78eLrArAsTfwRcNtUItIOMGnbp6F0DoeRmHG8E7n85g3g',
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri:
        'http://localhost:3009/oauth2callback',
      grant_type: 'authorization_code'
    })
  });

  const data = await res.json();
  console.log(data);
}

getToken();