const fetch = require('node-fetch');

exports.handler = async function(event, context) {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return { 
      statusCode: 405, 
      body: JSON.stringify({ error: 'Method Not Allowed' }) 
    };
  }
  
  try {
    const { country, ip, timestamp } = JSON.parse(event.body);
    
    // YOUR BOT TOKEN GOES HERE (but use environment variables - see next step)
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    
    const message = `🌍 New Visitor Alert!\n📍 Country: ${country}\n🌐 IP: ${ip}\n🕒 Time: ${timestamp}\n📱 User Agent: ${event.headers['user-agent']?.substring(0, 50)}...`;
    
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
    
    if (result.ok) {
      return {
        statusCode: 200,
        body: JSON.stringify({ success: true })
      };
    } else {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Telegram API error' })
      };
    }
    
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};