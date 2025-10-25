const https = require('https');

// Your Twitch app credentials
const CLIENT_ID = 'tiht9z9xigubud8ca68xu0664b4wub';
const CLIENT_SECRET = '41ejqxud8u68z10yx9feq7w64upcwt';

// Get app access token
async function getAppAccessToken() {
  return new Promise((resolve, reject) => {
    const postData = `client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&grant_type=client_credentials`;
    
    const options = {
      hostname: 'id.twitch.tv',
      port: 443,
      path: '/oauth2/token',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (response.access_token) {
            console.log('✅ Successfully obtained Twitch access token!');
            console.log('🔑 Access Token:', response.access_token);
            console.log('⏰ Expires in:', response.expires_in, 'seconds');
            console.log('📝 Token Type:', response.token_type);
            resolve(response);
          } else {
            console.error('❌ Failed to get access token:', response);
            reject(new Error('No access token in response'));
          }
        } catch (error) {
          console.error('❌ Error parsing response:', error);
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Request error:', error);
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

// Test the token
async function testToken(accessToken) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.twitch.tv',
      port: 443,
      path: '/helix/games?name=Minecraft',
      method: 'GET',
      headers: {
        'Client-ID': CLIENT_ID,
        'Authorization': `Bearer ${accessToken}`
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (res.statusCode === 200) {
            console.log('✅ Token test successful!');
            console.log('🎮 Found game:', response.data[0]?.name);
            resolve(true);
          } else {
            console.error('❌ Token test failed:', res.statusCode, response);
            reject(new Error(`Token test failed: ${res.statusCode}`));
          }
        } catch (error) {
          console.error('❌ Error parsing test response:', error);
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Test request error:', error);
      reject(error);
    });

    req.end();
  });
}

// Main execution
async function main() {
  try {
    console.log('🔧 Getting Twitch app access token...');
    const tokenResponse = await getAppAccessToken();
    
    console.log('\n🧪 Testing the token...');
    await testToken(tokenResponse.access_token);
    
    console.log('\n📋 Next steps:');
    console.log('1. Copy the access token above');
    console.log('2. Update your twitchService.ts with the new token');
    console.log('3. Test the live streams feature');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

main();
