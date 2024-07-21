// Add this to the beginning of your app.js file
const socket = new WebSocket('ws://localhost:3000');

socket.onmessage = function(event) {
    const data = JSON.parse(event.data);
    if (data.type === 'transaction') {
        addTransactionToGraph(data.data);
        updateCoinBalance(data.data.coinType, data.data.amount);
    }
};

function updateCoinBalance(coinType, amount) {
    coins[coinType].balance -= amount;
    updateCoinBalances();
}

function addTransactionToGraph(transaction) {
    const newTxId = `Tx ${nodes.filter(n => n.group === 2).length + 1}`;
    nodes.push({ id: newTxId, group: 2 });
    links.push({ source: "Block 3", target: newTxId, value: 1 });
    updateGraph();
}

// Sample data for the neural blockchain
const nodes = [
    { id: "Block 1", group: 1 },
    { id: "Block 2", group: 1 },
    { id: "Block 3", group: 1 },
    { id: "Tx 1", group: 2 },
    { id: "Tx 2", group: 2 },
    { id: "Tx 3", group: 2 },
    { id: "Tx 4", group: 2 },
    { id: "Tx 5", group: 2 },
];

const links = [
    { source: "Block 1", target: "Block 2", value: 1 },
    { source: "Block 2", target: "Block 3", value: 1 },
    { source: "Block 1", target: "Tx 1", value: 1 },
    { source: "Block 1", target: "Tx 2", value: 1 },
    { source: "Block 2", target: "Tx 3", value: 1 },
    { source: "Block 2", target: "Tx 4", value: 1 },
    { source: "Block 3", target: "Tx 5", value: 1 },
];

// Set up the SVG
const width = 800;
const height = 600;

const svg = d3.select("#graph-container")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

// Create a force simulation
const simulation = d3.forceSimulation(nodes)
    .force("link", d3.forceLink(links).id(d => d.id))
    .force("charge", d3.forceManyBody().strength(-400))
    .force("center", d3.forceCenter(width / 2, height / 2));

// Create the links
const link = svg.append("g")
    .selectAll("line")
    .data(links)
    .enter().append("line")
    .attr("class", "link");

// Create the nodes
const node = svg.append("g")
    .selectAll("g")
    .data(nodes)
    .enter().append("g")

node.append("circle")
    .attr("class", "node")
    .attr("r", 10)
    .attr("fill", d => d.group === 1 ? "#69b3a2" : "#ffa500");

node.append("text")
    .text(d => d.id)
    .attr('x', 12)
    .attr('y', 3);

// Add drag capability
node.call(d3.drag()
    .on("start", dragstarted)
    .on("drag", dragged)
    .on("end", dragended));

// Update positions on each tick of the simulation
simulation.on("tick", () => {
    link
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);

    node
        .attr("transform", d => `translate(${d.x},${d.y})`);
});

// Drag functions
function dragstarted(event, d) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
}

function dragged(event, d) {
    d.fx = event.x;
    d.fy = event.y;
}

function dragended(event, d) {
    if (!event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
}

// Coin objects
const coins = {
    TechCoin: { balance: 1000, color: "#007bff" },
    CarCoin: { balance: 750, color: "#28a745" },
    FoodCoin: { balance: 500, color: "#ffc107" },
    AstraCoin: { balance: 250, color: "#6f42c1" },
    BioCoin: { balance: 100, color: "#20c997" }
};

// Update coin balances
function updateCoinBalances() {
    for (let coin in coins) {
        document.querySelector(`#${coin.toLowerCase()} .balance span`).textContent = coins[coin].balance;
    }
}

// Initial update
updateCoinBalances();

// Simulate transactions every 5 seconds
setInterval(() => {
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

        // Add new transaction to the graph
        const newTxId = `Tx ${nodes.filter(n => n.group === 2).length + 1}`;
        nodes.push({ id: newTxId, group: 2 });
        links.push({ source: "Block 3", target: newTxId, value: 1 });

        // Update the graph
        simulation.nodes(nodes);
        simulation.force("link").links(links);
        simulation.alpha(1).restart();

        // Update SVG elements
        link = link.data(links);
        link.exit().remove();
        link = link.enter().append("line").attr("class", "link").merge(link);

        node = node.data(nodes);
        node.exit().remove();
        const newNode = node.enter().append("g");
        newNode.append("circle")
            .attr("class", "node")
            .attr("r", 10)
            .attr("fill", "#ffa500");
        newNode.append("text")
            .text(d => d.id)
            .attr('x', 12)
            .attr('y', 3);
        node = newNode.merge(node);

        node.call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));
    }
}, 5000);

// BioCoin implementation (POC)
function updateGraph() {
    // Update the links
    link = link.data(links);
    link.exit().remove();
    link = link.enter().append("line")
        .attr("class", "link")
        .merge(link);

    // Update the nodes
    node = node.data(nodes);
    node.exit().remove();
    const newNode = node.enter().append("g");
    newNode.append("circle")
        .attr("class", "node")
        .attr("r", 10)
        .attr("fill", d => d.group === 1 ? "#69b3a2" : "#ffa500");
    newNode.append("text")
        .text(d => d.id)
        .attr('x', 12)
        .attr('y', 3);
    node = newNode.merge(node);

    // Apply the updated data to the simulation
    simulation.nodes(nodes);
    simulation.force("link").links(links);

    // Restart the simulation
    simulation.alpha(1).restart();
}