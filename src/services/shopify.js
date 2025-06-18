const crypto = require('crypto');

function verifyShopifyRequest(rawBody, hmacHeader) {
    const secret = process.env.SHOPIFY_WEBHOOK_SECRET;
    
    // Ensure we're working with the raw Buffer
    const data = Buffer.isBuffer(rawBody) ? rawBody : Buffer.from(JSON.stringify(rawBody));
    
    // Clean the header (remove prefixes if any)
    const cleanHmacHeader = hmacHeader.replace(/^(sha256=|hmac-sha256=)/i, '');
    
    // Generate the hash using the raw Buffer
    const generatedHash = crypto
        .createHmac('sha256', secret)
        .update(data)
        .digest('base64');
    
    // Detailed debugging
    console.log('Debug Information:');
    console.log('Secret Key:', secret ? 'Present' : 'Missing');
    console.log('Raw Body Type:', typeof rawBody);
    console.log('Is Buffer:', Buffer.isBuffer(rawBody));
    console.log('Data Length:', data.length);
    console.log('Data (first 100 chars):', data.toString().substring(0, 100));
    console.log('Generated Hash:', generatedHash);
    console.log('Received Hash:', cleanHmacHeader);
    console.log('Hashes Match:', generatedHash === cleanHmacHeader);
    
    // Log the exact strings being compared
    console.log('Generated Hash (string):', generatedHash);
    console.log('Received Hash (string):', cleanHmacHeader);
    
    return generatedHash === cleanHmacHeader;
}

module.exports = { verifyShopifyRequest };
