// transaction-handling.js
let coins = {
    TechCoin: { balance: 1000, color: "#007bff" },
    CarCoin: { balance: 750, color: "#28a745" },
    FoodCoin: { balance: 500, color: "#ffc107" },
    AstraCoin: { balance: 250, color: "#6f42c1" },
    BioCoin: { balance: 100, color: "#20c997" }
};

export function initTransactionHandling(socket) {
    updateCoinBalances();
    setInterval(() => simulateTransaction(socket), 5000);
}

export function updateBalance(coinType, amount) {
    coins[coinType].balance -= amount;
    updateCoinBalances();
}

function updateCoinBalances() {
    for (let coin in coins) {
        document.querySelector(`#${coin.toLowerCase()} .balance span`).textContent = coins[coin].balance;
    }
}

function simulateTransaction(socket) {
    const coinNames = Object.keys(coins);
    const fromCoin = coinNames[Math.floor(Math.random() * coinNames.length)];
    let toCoin;
    do {
        toCoin = coinNames[Math.floor(Math.random() * coinNames.length)];
    } while (toCoin === fromCoin);

    const amount = Math.floor(Math.random() * 10) + 1;

    if (coins[fromCoin].balance >= amount) {
        coins[fromCoin].balance -= amount;
        coins[toCoin].balance += amount;
        updateCoinBalances();

        const transaction = {
            from: fromCoin,
            to: toCoin,
            amount: amount,
            timestamp: Date.now()
        };

        socket.send(JSON.stringify({ type: 'transaction', data: transaction }));
    }
}

export function updateTransactionHistory(transaction) {
    const transactionHistory = document.getElementById('transactionHistory');
    const txElement = document.createElement('div');
    txElement.textContent = `${transaction.from} sent ${transaction.amount} to ${transaction.to} at ${new Date(transaction.timestamp).toLocaleString()}`;
    transactionHistory.appendChild(txElement);
}