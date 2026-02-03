const http = require('http');

function testCommentsEndpoint() {
  const trackId = '693a93e47b854c5beb55c1fb';
  console.log(`Testing comments endpoint for track ID: ${trackId}`);
  
  const options = {
    hostname: 'localhost',
    port: 5000,
    path: `/api/comments/track/${trackId}`,
    method: 'GET'
  };
  
  const req = http.request(options, (res) => {
    console.log(`Response status: ${res.statusCode}`);
    
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        try {
          const comments = JSON.parse(data);
          console.log(`Success! Found ${comments.length} comments`);
        } catch (parseError) {
          console.log(`Success! Response data: ${data}`);
        }
      } else {
        console.log(`Error: ${res.statusCode} - ${data}`);
      }
    });
  });
  
  req.on('error', (error) => {
    console.error('Test failed with error:', error);
  });
  
  req.end();
}

testCommentsEndpoint();