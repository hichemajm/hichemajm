const fetch = require('node-fetch');

exports.handler = async function(event, context) {
  // Add CORS headers to allow requests from any domain
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return { 
      statusCode: 405, 
      headers,
      body: JSON.stringify({ error: 'Method Not Allowed' }) 
    };
  }
  
  try {
    const { country, timestamp, userAgent } = JSON.parse(event.body);
    
    // Get tokens from environment variables
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    
    if (!botToken || !chatId) {
      console.error('Missing environment variables');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Server configuration error' })
      };
    }
    
    const message = `🌍 New Visitor Alert!\n\n\n📍 Country: ${country}\n\n🕒 Time: ${timestamp}\n\n📱 Platform: ${userAgent || 'Unknown'}`;
    
    console.log('Sending to Telegram:', { country, timestamp });
    
    const telegramResponse = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message
      })
    });
    
    const result = await telegramResponse.json();
    
    console.log('Telegram API response:', result);
    
    if (result.ok) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, message: 'Notification sent' })
      };
    } else {
      console.error('Telegram API error:', result);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Telegram API error', details: result })
      };
    }
    
  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error', details: error.message })
    };
  }
};
