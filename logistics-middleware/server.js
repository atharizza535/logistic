require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const os = require('os');
const crypto = require('crypto');

// --- CONFIGURATION ---
const app = express();
const PORT = process.env.PORT || 6769;
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

app.use(cors());
app.use(bodyParser.json());

// --- HELPER ---
function getLocalIp() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) return iface.address;
        }
    }
    return 'localhost';
}

// --- VISUAL ROUTES ---

// 1. GET ALL ORDERS (Dashboard Poll)
app.get('/orders', async (req, res) => {
    // We won't log this one every time (too spammy), or we can log a dot '.'
    // process.stdout.write('.'); 
    const { data, error } = await supabase
        .from('packages')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
});

// 2. INGEST ORDER (Merchant)
app.post('/orders/ingest', async (req, res) => {
    const { external_order_id, merchant_id, recipient_details } = req.body || {};
    const tracking_number = `TRK-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

    const { error } = await supabase
        .from('packages')
        .insert([{
            external_order_id,
            merchant_id,
            recipient_details,
            tracking_number,
            status: 'awaiting_payment'
        }]);

    if (error) return res.status(400).json({ error: error.message });
    
    // VISUAL LOG
    console.log(`\n📦 [INGEST]   New Order Received`);
    console.log(`   └─ ID: ${external_order_id} | Tracking: ${tracking_number}`);
    
    res.status(201).json({ message: 'Order received', tracking_number, status: 'awaiting_payment' });
});

// 3. PAYMENT WEBHOOK (Payment Gateway)
app.post('/webhooks/payment', async (req, res) => {
    const { external_order_id, payment_transaction_id, payment_status } = req.body || {};
    
    if (payment_status !== 'success') return res.status(200).json({ message: 'Ignored' });

    const { data, error } = await supabase
        .from('packages')
        .update({ status: 'payment_verified', payment_transaction_id })
        .eq('external_order_id', external_order_id)
        .select();

    if (error) return res.status(500).json({ error: error.message });

    // VISUAL LOG
    console.log(`\nqy [PAYMENT]  Payment Verified`);
    console.log(`   └─ Order: ${external_order_id} | Txn: ${payment_transaction_id}`);

    res.json({ message: 'Payment recorded', order: data[0] });
});

// 4. CHECK STATUS (Store/Partner Tracker)
app.get('/partners/status/:id', async (req, res) => {
    const { id } = req.params;
    const { data, error } = await supabase
        .from('packages')
        .select('external_order_id, status, tracking_number')
        .eq('external_order_id', id)
        .single();

    if (error) return res.status(404).json({ error: 'Order not found' });

    // VISUAL LOG
    console.log(`\n🔍 [STATUS]   Partner checked status`);
    console.log(`   └─ Order: ${id} is currently '${data.status}'`);

    res.json(data);
});

// 5. DISPATCH (Driver)
app.post('/dispatch', async (req, res) => {
    const { tracking_number, driver_id } = req.body || {};
    
    const { data: pkg } = await supabase
        .from('packages')
        .select('*')
        .eq('tracking_number', tracking_number)
        .single();

    if (!pkg) return res.status(404).json({ error: 'Package not found' });

    if (pkg.status !== 'payment_verified') {
        console.log(`\nzz [BLOCKED]  Driver ${driver_id} tried to take unpaid package ${tracking_number}`);
        return res.status(403).json({ error: 'dispatch_denied', reason: 'Not paid yet' });
    }

    const { error } = await supabase
        .from('packages')
        .update({ status: 'in_transit' })
        .eq('tracking_number', tracking_number);

    if (error) return res.status(500).json({ error: error.message });

    // VISUAL LOG
    console.log(`\n🚚 [DISPATCH] Driver picked up package`);
    console.log(`   └─ Tracking: ${tracking_number} | Driver: ${driver_id}`);
    console.log(`   └─ Status Change: payment_verified -> in_transit`);

    res.json({ message: 'Dispatch successful', new_status: 'in_transit' });
});

// 6. NOTIFY / DELIVER (Internal System)
app.post('/notify', async (req, res) => {
    const { external_order_id, status } = req.body || {};

    const { error } = await supabase
        .from('packages')
        .update({ status: status })
        .eq('external_order_id', external_order_id);

    if (error) return res.status(500).json({ error: error.message });
    
    // VISUAL LOG
    console.log(`\n🔔 [NOTIFY]   Webhook sent to Store`);
    console.log(`   └─ Order: ${external_order_id} is now '${status}'`);

    res.json({ success: true, new_status: status });
});

// --- START ---
app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n==================================================`);
    console.log(`🚀 LOGISTICS ENGINE ACTIVE - VISUAL MODE`);
    console.log(`--------------------------------------------------`);
    console.log(`> Local:   http://localhost:${PORT}`);
    console.log(`> LAN:     http://${getLocalIp()}:${PORT}`);
    console.log(`==================================================\n`);
});