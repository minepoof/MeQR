// blockchain-visualization.js
let nodes, links, simulation, svg, link, node;

export function initBlockchainVisualization() {
    setupInitialData();
    createVisualization();
    startSimulation();
}

function setupInitialData() {
    nodes = [
        { id: "Block 1", group: 1 },
        { id: "Block 2", group: 1 },
        { id: "Block 3", group: 1 },
        { id: "Tx 1", group: 2 },
        { id: "Tx 2", group: 2 },
        { id: "Tx 3", group: 2 },
        { id: "Tx 4", group: 2 },
        { id: "Tx 5", group: 2 },
    ];

    links = [
        { source: "Block 1", target: "Block 2", value: 1 },
        { source: "Block 2", target: "Block 3", value: 1 },
        { source: "Block 1", target: "Tx 1", value: 1 },
        { source: "Block 1", target: "Tx 2", value: 1 },
        { source: "Block 2", target: "Tx 3", value: 1 },
        { source: "Block 2", target: "Tx 4", value: 1 },
        { source: "Block 3", target: "Tx 5", value: 1 },
    ];
}

function createVisualization() {
    const width = 800;
    const height = 600;

    svg = d3.select("#graph-container")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    link = svg.append("g")
        .selectAll("line")
        .data(links)
        .enter().append("line")
        .attr("class", "link");

    node = svg.append("g")
        .selectAll("g")
        .data(nodes)
        .enter().append("g");

    node.append("circle")
        .attr("class", "node")
        .attr("r", 10)
        .attr("fill", d => d.group === 1 ? "#69b3a2" : "#ffa500");

    node.append("text")
        .text(d => d.id)
        .attr('x', 12)
        .attr('y', 3);

    node.call(d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended));
}

function startSimulation() {
    simulation = d3.forceSimulation(nodes)
        .force("link", d3.forceLink(links).id(d => d.id))
        .force("charge", d3.forceManyBody().strength(-400))
        .force("center", d3.forceCenter(width / 2, height / 2));

    simulation.on("tick", () => {
        link
            .attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);

        node
            .attr("transform", d => `translate(${d.x},${d.y})`);
    });
}

export function addTransactionToGraph(transaction) {
    const newTxId = `Tx ${nodes.filter(n => n.group === 2).length + 1}`;
    nodes.push({ id: newTxId, group: 2 });
    links.push({ source: "Block 3", target: newTxId, value: 1 });
    updateGraph();
}

function updateGraph() {
    link = link.data(links);
    link.exit().remove();
    link = link.enter().append("line")
        .attr("class", "link")
        .merge(link);

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

    simulation.nodes(nodes);
    simulation.force("link").links(links);
    simulation.alpha(1).restart();
}

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