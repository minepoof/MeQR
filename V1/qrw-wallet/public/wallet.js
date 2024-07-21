document.addEventListener('DOMContentLoaded', () => {
    const balanceAmount = document.getElementById('balanceAmount');
    const sendBtn = document.getElementById('sendBtn');
    const receiveBtn = document.getElementById('receiveBtn');
    const transactionHistory = document.getElementById('transactionHistory');

    // Fetch wallet data
    async function fetchWalletData() {
        try {
            const response = await fetch('/wallet-data');
            const data = await response.json();
            for (let coin in data.balances) {
                document.getElementById(`${coin.toLowerCase()}Balance`).textContent = data.balances[coin];
            }
            renderTransactionHistory(data.transactions);
        } catch (error) {
            console.error('Error fetching wallet data:', error);
        }
    }

    // Render transaction history
    function renderTransactionHistory(transactions) {
        transactionHistory.innerHTML = '<h2>Transaction History</h2>';
        transactions.forEach(tx => {
            const txElement = document.createElement('div');
            txElement.classList.add('transaction');
            txElement.textContent = `${tx.type}: ${tx.amount} QRW - ${new Date(tx.timestamp).toLocaleString()}`;
            transactionHistory.appendChild(txElement);
        });
    }

    // Send QRW
    sendBtn.addEventListener('click', () => {
        const amount = prompt('Enter amount to send:');
        const recipient = prompt('Enter recipient address:');
        if (amount && recipient) {
            fetch('/send-qrw', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ amount, recipient }),
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('Transaction sent successfully!');
                    fetchWalletData();
                } else {
                    alert('Transaction failed: ' + data.message);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('An error occurred while sending the transaction.');
            });
        }
    });

    // Receive QRW (show address)
    receiveBtn.addEventListener('click', () => {
        fetch('/wallet-address')
            .then(response => response.json())
            .then(data => {
                alert(`Your wallet address is: ${data.address}`);
            })
            .catch(error => {
                console.error('Error:', error);
                alert('An error occurred while fetching the wallet address.');
            });
    });

    // Initial data fetch
    fetchWalletData();
});