// main.js
import { initProfileManagement } from './profile-management.js';
import { initBlockchainVisualization } from './blockchain-visualization.js';
import { initTransactionHandling } from './transaction-handling.js';

const socket = new WebSocket('ws://localhost:3000');

document.addEventListener('DOMContentLoaded', () => {
    initProfileManagement();
    initBlockchainVisualization();
    initTransactionHandling(socket);

    socket.onmessage = function(event) {
        const data = JSON.parse(event.data);
        if (data.type === 'transaction') {
            addNewTransaction(data.data);
            updateCoinBalance(data.data.coinType, data.data.amount);
        }
    };
});

function addNewTransaction(transaction) {
    // Call functions from blockchain-visualization.js and transaction-handling.js
    addTransactionToGraph(transaction);
    updateTransactionHistory(transaction);
}

function updateCoinBalance(coinType, amount) {
    // Call function from transaction-handling.js
    updateBalance(coinType, amount);
}