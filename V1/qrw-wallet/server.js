const express = require('express');
const crypto = require('crypto');
const QRCode = require('qrcode');
const WebSocket = require('ws');

const app = express();
const server = require('http').createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.json());
app.use(express.static('public'));

// In-memory storage (replace with a database in production)
const wallets = {};
const transactions = [];
const coins = {
    TechCoin: { balance: 1000 },
    CarCoin: { balance: 750 },
    FoodCoin: { balance: 500 },
    AstraCoin: { balance: 250 },
    BioCoin: { balance: 100 }
};

// Generate a new QRW wallet
app.post('/generate-wallet', (req, res) => {
    const keyPair = crypto.generateKeyPairSync('ec', {
        namedCurve: 'secp256k1',
        publicKeyEncoding: { type: 'spki', format: 'pem' },
        privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
    });

    const publicKey = crypto.createHash('sha256').update(keyPair.publicKey).digest('hex');
    const address = 'QRW' + publicKey.substring(0, 34);

    wallets[address] = {
        publicKey: keyPair.publicKey,
        privateKey: keyPair.privateKey,
        balance: 0
    };

    QRCode.toDataURL(`https://yoursite.com/wallet/${address}`, (err, url) => {
        if (err) res.status(500).json({ error: 'QR generation failed' });
        else res.json({ address, qrCode: url });
    });
});

// Get wallet details
app.get('/wallet/:address', (req, res) => {
    const wallet = wallets[req.params.address];
    if (wallet) {
        res.json({
            address: req.params.address,
            balance: wallet.balance,
        });
    } else {
        res.status(404).json({ error: 'Wallet not found' });
    }
});

// Get wallet data
app.get('/wallet-data', (req, res) => {
    res.json({
        balance: coins.BioCoin.balance,
        transactions: transactions
    });
});

// Send BioCoin
app.post('/send-biocoin', (req, res) => {
    const { amount, from, to } = req.body;
    if (amount > 0 && from && to) {
        if (coins.BioCoin.balance >= amount) {
            coins.BioCoin.balance -= amount;
            const transaction = { type: 'Sent', amount, from, to, timestamp: Date.now() };
            transactions.push(transaction);
            broadcastTransaction(transaction);
            res.json({ success: true });
        } else {
            res.json({ success: false, message: 'Insufficient balance' });
        }
    } else {
        res.json({ success: false, message: 'Invalid amount, sender, or recipient' });
    }
});

// Get wallet address
app.get('/wallet-address', (req, res) => {
    res.json({ address: 'QRW123456789' }); // Replace with actual logic
});

// WebSocket connection
wss.on('connection', (ws) => {
    console.log('New WebSocket connection');
    ws.send(JSON.stringify({ type: 'initial', data: { coins, transactions } }));
});

function broadcastTransaction(transaction) {
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: 'transaction', data: transaction }));
        }
    });
}

// Simulate transactions every 5 seconds
setInterval(() => {
    const amount = Math.floor(Math.random() * 10) + 1;
    if (coins.BioCoin.balance >= amount) {
        coins.BioCoin.balance -= amount;
        const transaction = {
            type: 'Simulated',
            amount,
            from: 'SimulatedWallet',
            to: 'RandomWallet',
            timestamp: Date.now()
        };
        transactions.push(transaction);
        broadcastTransaction(transaction);
    }
}, 5000);

// Update Static file serving
app.use(express.static('qrw-wallet/public'));
app.use('/blockchain', express.static('blockchain-visualizer'));

const PORT = 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Add this to server.js
app.use(express.static('public'));