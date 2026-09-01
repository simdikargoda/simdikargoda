const crypto = require('crypto');
const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function run() {
  const client = new Client({ connectionString: process.env.DIRECT_URL });
  await client.connect();

  // En son oluşturulan kargonun tracking numarasını alalım
  const res = await client.query('SELECT id, tracking_number, provider FROM shipments ORDER BY created_at DESC LIMIT 1;');
  if (res.rows.length === 0) {
    console.log("Kargo bulunamadı!");
    return;
  }

  const shipment = res.rows[0];
  console.log(`Test edilecek kargo: ${shipment.tracking_number} (${shipment.provider})`);

  const payload = JSON.stringify({
    provider: shipment.provider,
    trackingNumber: shipment.tracking_number,
    status: 'delivered',
    description: 'Teslim edildi (Webhook Testi)',
    occurredAt: new Date().toISOString()
  });

  const secret = 'my_test_secret_123';
  const signature = crypto.createHmac('sha256', secret).update(payload).digest('hex');

  console.log("Gönderilecek Payload:", payload);
  console.log("HMAC Signature:", signature);

  const fetchRes = await fetch(`http://localhost:3000/api/webhooks/cargo/${shipment.provider}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-webhook-signature': signature
    },
    body: payload
  });

  console.log("Response Status:", fetchRes.status);
  console.log("Response Body:", await fetchRes.text());

  // Durumu kontrol et
  const updated = await client.query(`SELECT status FROM shipments WHERE id = '${shipment.id}';`);
  console.log("Yeni Durum:", updated.rows[0].status);
  
  await client.end();
}

run().catch(console.error);
