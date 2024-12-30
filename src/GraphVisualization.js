import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { toPng } from "html-to-image";
import "./GraphVisualization.css";
import db from "./assets/down-arrow_752650.png";

const GraphVisualization = () => {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [isDirected, setIsDirected] = useState(true);
  const [queueState, setQueueState] = useState([]);
  const [visitedNodes, setVisitedNodes] = useState(new Set());
  const [topoSortResult, setTopoSortResult] = useState("");
  const [shortestPathResult, setShortestPathResult] = useState("");
  const [showShortestPathInputs, setShowShortestPathInputs] = useState(false);
  const [shortestPathInput, setShortestPathInput] = useState({
    startNode: "",
    endNode: "",
  });
  const [highlightedNodes, setHighlightedNodes] = useState([]);



  const svgRef = useRef();
  const graphContainerRef = useRef(); // Ref for the graph container

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInput(value);
    validateInput(value);
  };

  const validateInput = (input) => {
    try {
      const lines = input.trim().split("\n");
      const newNodes = [];
      const newEdges = [];
  
      lines.forEach((line) => {
        const parts = line.trim().split(" ");
        if (parts.length < 2 || isNaN(parts[0]) || isNaN(parts[1])) {
          throw new Error("Invalid input format! Each line must have two integers, and optionally a weight.");
        }
  
        const [from, to, weight] = parts;
        if (!newNodes.some((node) => node.id === from)) newNodes.push({ id: from });
        if (!newNodes.some((node) => node.id === to)) newNodes.push({ id: to });
  
        // Handle optional weight
        const edgeWeight = weight ? parseInt(weight) : null;  // Set to null if no weight provided
        newEdges.push({ source: from, target: to, weight: edgeWeight });
  
        if (!isDirected) {
          newEdges.push({ source: to, target: from, weight: edgeWeight });
        }
      });
  
      const uniqueEdges = newEdges.filter(
        (edge, index, self) =>
          index ===
          self.findIndex(
            (e) =>
              (e.source === edge.source && e.target === edge.target) ||
              (e.source === edge.target && e.target === edge.source)
          )
      );
  
      setNodes(newNodes);
      setEdges(uniqueEdges);
      setError("");
    } catch (error) {
      setError(error.message);
    }
  };
  

  const downloadGraph = () => {
    if (graphContainerRef.current) {
      toPng(graphContainerRef.current)
        .then((dataUrl) => {
          const link = document.createElement("a");
          link.download = "graph_visualization.png";
          link.href = dataUrl;
          link.click();
        })
        .catch((err) => {
          console.error("Failed to download graph as PNG:", err);
        });
    }
  };

  /*
  useEffect(() => {
  const svg = d3.select(svgRef.current);
  svg.selectAll("*").remove(); // Clear previous content

  if (nodes.length === 0 || edges.length === 0) return;

  const initialWidth = 800;
  const initialHeight = 400;

  // Expandable boundaries for scrollable graph
  let graphExtent = {
    xMin: 0,
    xMax: initialWidth,
    yMin: 0,
    yMax: initialHeight,
  };

  // Define simulation with forces
  const simulation = d3
    .forceSimulation(nodes)
    .force(
      "link",
      d3
        .forceLink(edges)
        .id((d) => d.id)
        .distance(160)
    )
    .force("charge", d3.forceManyBody().strength(-500))
    .force("center", d3.forceCenter(initialWidth / 2, initialHeight / 2))
    .force("collision", d3.forceCollide().radius(40))
    .on("tick", ticked);

  // Define arrow markers for directed edges
  svg
    .append("defs")
    .append("marker")
    .attr("id", "arrowhead")
    .attr("viewBox", "0 -5 10 10")
    .attr("refX", 28)
    .attr("refY", 0)
    .attr("orient", "auto")
    .attr("markerWidth", 6)
    .attr("markerHeight", 6)
    .append("path")
    .attr("d", "M0,-5L10,0L0,5")
    .attr("fill", "#555");

  // Add edges
  const link = svg
    .append("g")
    .attr("class", "links")
    .selectAll("line")
    .data(edges)
    .enter()
    .append("line")
    .attr("stroke", "#aaa")
    .attr("stroke-width", 2)
    .attr("marker-end", isDirected ? "url(#arrowhead)" : null);

  // Add nodes
  const node = svg
    .append("g")
    .attr("class", "nodes")
    .selectAll("circle")
    .data(nodes)
    .enter()
    .append("circle")
    .attr("r", 24)
    .attr("stroke", "#333")
    .attr("stroke-width", 1.5)
    .attr("fill", "#69b3a2")
    .call(
      d3
        .drag()
        .on("start", dragStarted)
        .on("drag", dragged)
        .on("end", dragEnded)
    );

  // Add labels
  const label = svg
    .append("g")
    .attr("class", "labels")
    .selectAll("text")
    .data(nodes)
    .enter()
    .append("text")
    .text((d) => d.id)
    .attr("font-size", "12px")
    .attr("text-anchor", "middle")
    .attr("dy", ".35em")
    .attr("fill", "#fff");

  // Add edge labels
  const edgeLabels = svg
    .append("g")
    .attr("class", "edge-labels")
    .selectAll("text")
    .data(edges)
    .enter()
    .append("text")
    .text((d) => (d.weight !== null ? d.weight : ""))
    .attr("font-size", "12px")
    .attr("text-anchor", "middle")
    .attr("dy", "-10px")
    .attr("fill", "black");

  // Update positions on tick
  function ticked() {
    link
      .attr("x1", (d) => d.source.x)
      .attr("y1", (d) => d.source.y)
      .attr("x2", (d) => d.target.x)
      .attr("y2", (d) => d.target.y);

    node.attr("cx", (d) => d.x).attr("cy", (d) => d.y);

    label.attr("x", (d) => d.x).attr("y", (d) => d.y);

    edgeLabels
      .attr("x", (d) => (d.source.x + d.target.x) / 2)
      .attr("y", (d) => (d.source.y + d.target.y) / 2);

    // Update graph extent dynamically based on node positions
    nodes.forEach((d) => {
      graphExtent.xMin = Math.min(graphExtent.xMin, d.x);
      graphExtent.xMax = Math.max(graphExtent.xMax, d.x);
      graphExtent.yMin = Math.min(graphExtent.yMin, d.y);
      graphExtent.yMax = Math.max(graphExtent.yMax, d.y);
    });

    // Add padding around the graph
    const padding = 50;
    const newWidth = graphExtent.xMax - graphExtent.xMin + 2 * padding;
    const newHeight = graphExtent.yMax - graphExtent.yMin + 2 * padding;

    // Adjust the SVG viewBox dynamically
    svg
      .attr(
        "viewBox",
        `${graphExtent.xMin - padding} ${graphExtent.yMin - padding} ${newWidth} ${newHeight}`
      )
      .attr("preserveAspectRatio", "xMidYMid meet");
  }

  // Dragging logic
  function dragStarted(event, d) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }

  function dragged(event, d) {
    d.fx = event.x;
    d.fy = event.y;
  }

  function dragEnded(event, d) {
    if (!event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }

  return () => simulation.stop();
}, [nodes, edges, isDirected]);

*/ 
useEffect(() => {
  const svg = d3.select(svgRef.current);
  svg.selectAll("*").remove(); // Clear previous content

  if (nodes.length === 0 || edges.length === 0) return;

  const initialWidth = 800;
  const initialHeight = 400;

  // Expandable boundaries for scrollable graph
  let graphExtent = {
    xMin: 0,
    xMax: initialWidth,
    yMin: 0,
    yMax: initialHeight,
  };

  // Define simulation with forces
  const simulation = d3
    .forceSimulation(nodes)
    .force(
      "link",
      d3
        .forceLink(edges)
        .id((d) => d.id)
        .distance(160)
    )
    .force("charge", d3.forceManyBody().strength(-500))
    .force("center", d3.forceCenter(initialWidth / 2, initialHeight / 2))
    .force("collision", d3.forceCollide().radius(40))
    .on("tick", ticked);

  // Define arrow markers for directed edges
  svg
    .append("defs")
    .append("marker")
    .attr("id", "arrowhead")
    .attr("viewBox", "0 -5 10 10")
    .attr("refX", 28)
    .attr("refY", 0)
    .attr("orient", "auto")
    .attr("markerWidth", 6)
    .attr("markerHeight", 6)
    .append("path")
    .attr("d", "M0,-5L10,0L0,5")
    .attr("fill", "#555");

  // Add edges
  const link = svg
    .append("g")
    .attr("class", "links")
    .selectAll("line")
    .data(edges)
    .enter()
    .append("line")
    .attr("stroke", "#aaa")
    .attr("stroke-width", 2)
    .attr("marker-end", isDirected ? "url(#arrowhead)" : null);

  // Add nodes
  const node = svg
  .append("g")
  .attr("class", "nodes")
  .selectAll("circle")
  .data(nodes)
  .enter()
  .append("circle")
  .attr("r", 24)
  .attr("stroke", "#333")
  .attr("stroke-width", 1.5)
  .attr("fill", "#69b3a2")
  .attr("class", (d) => `node node-${d.id}`) // Add unique class
  .call(
    d3
      .drag()
      .on("start", dragStarted)
      .on("drag", dragged)
      .on("end", dragEnded)
  );

  // Add labels
  const label = svg
    .append("g")
    .attr("class", "labels")
    .selectAll("text")
    .data(nodes)
    .enter()
    .append("text")
    .text((d) => d.id)
    .attr("font-size", "12px")
    .attr("text-anchor", "middle")
    .attr("dy", ".35em")
    .attr("fill", "#fff");

  // Add edge labels
  const edgeLabels = svg
    .append("g")
    .attr("class", "edge-labels")
    .selectAll("text")
    .data(edges)
    .enter()
    .append("text")
    .text((d) => (d.weight !== null ? d.weight : ""))
    .attr("font-size", "12px")
    .attr("text-anchor", "middle")
    .attr("dy", "-10px")
    .attr("fill", "black");

  // Update positions on tick
  function ticked() {
    link
      .attr("x1", (d) => d.source.x)
      .attr("y1", (d) => d.source.y)
      .attr("x2", (d) => d.target.x)
      .attr("y2", (d) => d.target.y);

    node.attr("cx", (d) => d.x).attr("cy", (d) => d.y);

    label.attr("x", (d) => d.x).attr("y", (d) => d.y);

    edgeLabels
      .attr("x", (d) => (d.source.x + d.target.x) / 2)
      .attr("y", (d) => (d.source.y + d.target.y) / 2);

    // Update graph extent dynamically based on node positions
    nodes.forEach((d) => {
      graphExtent.xMin = Math.min(graphExtent.xMin, d.x);
      graphExtent.xMax = Math.max(graphExtent.xMax, d.x);
      graphExtent.yMin = Math.min(graphExtent.yMin, d.y);
      graphExtent.yMax = Math.max(graphExtent.yMax, d.y);
    });

    // Add padding around the graph
    const padding = 50;
    const newWidth = graphExtent.xMax - graphExtent.xMin + 2 * padding;
    const newHeight = graphExtent.yMax - graphExtent.yMin + 2 * padding;

    // Adjust the SVG viewBox dynamically
    svg
      .attr(
        "viewBox",
        `${graphExtent.xMin - padding} ${graphExtent.yMin - padding} ${newWidth} ${newHeight}`
      )
      .attr("preserveAspectRatio", "xMidYMid meet");
  }

  // Dragging logic
  function dragStarted(event, d) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }

  function dragged(event, d) {
    d.fx = event.x;
    d.fy = event.y;
  }

  function dragEnded(event, d) {
    if (!event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }

  return () => simulation.stop();
}, [nodes, edges, isDirected]);


  const handleBFS = () => {
    const startNode = nodes[0].id; 
    const queue = [startNode];
    const visited = new Set();
    visited.add(startNode);
  
    const bfsTraversal = (prevNode = null) => {
      if (queue.length === 0) {
        // Remove highlight for the last processed node
        if (prevNode) d3.select(`.node-${prevNode}`).classed("highlighted", false);
        return;
      }
  
      const currentNode = queue.shift(); // Dequeue node
      setQueueState((prevQueueState) => [...prevQueueState, currentNode]);
      setVisitedNodes((prevVisitedNodes) => new Set(prevVisitedNodes.add(currentNode)));
  
      // Remove highlight for the previously processed node
      if (prevNode) {
        d3.select(`.node-${prevNode}`).classed("highlighted", false);
      }
  
      // Highlight the current node
      d3.select(`.node-${currentNode}`).classed("highlighted", true);
  
      const neighbors = edges
        .filter(
          (edge) =>
            edge.source.id === currentNode || edge.target.id === currentNode
        )
        .map((edge) =>
          edge.source.id === currentNode ? edge.target.id : edge.source.id
        );
  
      neighbors.forEach((neighbor) => {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push(neighbor);
        }
      });
  
      setTimeout(() => bfsTraversal(currentNode), 500); 
    };
  
    bfsTraversal();
    setShowShortestPathInputs(false);
  };
  const handleDFS = () => {
    const startNode = nodes[0].id; 
    const visited = new Set();
  
    const dfsTraversal = (currentNode, prevNode = null) => {
      if (visited.has(currentNode)) return;
  
      visited.add(currentNode);
      setVisitedNodes((prevVisitedNodes) => new Set(prevVisitedNodes.add(currentNode)));
  
      // Remove highlight for the previously processed node
      if (prevNode) {
        d3.select(`.node-${prevNode}`).classed("highlighted", false);
      }
  
      // Highlight the current node
      d3.select(`.node-${currentNode}`).classed("highlighted", true);

      const neighbors = edges
        .filter(
          (edge) =>
            edge.source.id === currentNode || edge.target.id === currentNode
        )
        .map((edge) =>
          edge.source.id === currentNode ? edge.target.id : edge.source.id
        );
  
      setTimeout(() => {
        neighbors.forEach((neighbor) => {
          if (!visited.has(neighbor)) {
            dfsTraversal(neighbor, currentNode);
          }
        });
        if (!neighbors.length && prevNode !== null) {
          d3.select(`.node-${currentNode}`).classed("highlighted", false);
        }
      }, 500);
    };
  
    dfsTraversal(startNode);
    setShowShortestPathInputs(false);
  };
  const handleTopoSort = () => {
    const inDegree = {};
    nodes.forEach(node => {
      inDegree[node.id] = 0;
    });
  
    edges.forEach(edge => {
      inDegree[edge.target.id] = (inDegree[edge.target.id] || 0) + 1;
    });
    const queue = [];
    nodes.forEach(node => {
      if (inDegree[node.id] === 0) {
        queue.push(node.id);
      }
    });
  
    let topologicalOrder = [];
    let visitedCount = 0;
  
    while (queue.length > 0) {
      const currentNode = queue.shift(); // Dequeue node
  
      topologicalOrder.push(currentNode); // Add it to topological order
      visitedCount++;
  
      // Find all neighbors (edges) of the current node and decrease their in-degree
      edges.forEach(edge => {
        if (edge.source.id === currentNode) {
          const neighbor = edge.target.id;
          inDegree[neighbor]--;
  
          // If in-degree of neighbor becomes 0, add it to the queue
          if (inDegree[neighbor] === 0) {
            queue.push(neighbor);
          }
        }
      });
      setShowShortestPathInputs(false);
    }
  
    // Check if there was a cycle (graph is not a DAG)
    if (visitedCount !== nodes.length) {
      setError("The graph is not a Directed Acyclic Graph (DAG). Topological Sort not possible.");
      return;
    }
    setError(""); // Clear previous errors
    setTopoSortResult(topologicalOrder.join(" → "));
  };
  
  const handleGetPath = () => {
    setShowShortestPathInputs(true);
  };
  const findShortestPath = () => {
    const { startNode, endNode } = shortestPathInput;
  
    // Validate input
    if (!startNode || !endNode) {
      setError("Please provide both start and end nodes.");
      setShortestPathResult("");
      setHighlightedNodes([]); // Clear highlighted nodes
      return;
    }
    const graph = new Map();
    edges.forEach(({ source, target, weight }) => {
      if (!graph.has(source.id)) graph.set(source.id, []);
      graph.get(source.id).push({ node: target.id, weight });
      if (!isDirected) {
        if (!graph.has(target.id)) graph.set(target.id, []);
        graph.get(target.id).push({ node: source.id, weight });
      }
    });
    const distances = {};
    const previousNodes = {};
    const pq = new Set(nodes.map((node) => node.id)); // Priority Queue
  
    nodes.forEach(({ id }) => {
      distances[id] = id === startNode ? 0 : Infinity;
      previousNodes[id] = null;
    });
  
    // Dijkstra's Algorithm
    while (pq.size) {
      const current = [...pq].reduce((a, b) => distances[a] < distances[b] ? a : b);
      pq.delete(current);
      if (current === endNode) break;
  
      // Process neighbors
      const neighbors = graph.get(current) || [];
      neighbors.forEach(({ node: neighbor, weight }) => {
        const alt = distances[current] + weight;
        if (alt < distances[neighbor]) {
          distances[neighbor] = alt;
          previousNodes[neighbor] = current;
        }
      });
    }
  
    // Reconstruct the shortest path
    let path = [];
    let currentNode = endNode;
    while (currentNode) {
      path.unshift(currentNode);
      currentNode = previousNodes[currentNode];
    }

    if (path[0] !== startNode) {
      setError(`No path exists between ${startNode} and ${endNode}.`);
      setShortestPathResult("");
      setHighlightedNodes([]); // Clear highlighted nodes
    } else {
      setError("");
      setShortestPathResult(path.join(" → "));
      setHighlightedNodes(path); // Set highlighted nodes for the shortest path
  
      // To Highlight the nodes in the shortest path
      path.forEach((nodeId) => {
        d3.select(`.node-${nodeId}`).classed("highlighted", true);
      });

      setTimeout(() => {
        path.forEach((nodeId) => {
          d3.select(`.node-${nodeId}`).classed("highlighted", false);
        });
      }, 2000); 
    }
    setShowShortestPathInputs(false);
  };
  
  const handleMST = () => {
    if (edges.length === 0 || nodes.length === 0) {
      setError("Graph must have nodes and edges to compute MST.");
      return;
    }
  
    const sortedEdges = [...edges].sort((a, b) => (a.weight || 0) - (b.weight || 0));
  

    const parent = {};
    const rank = {};
  
    nodes.forEach(({ id }) => {
      parent[id] = id;
      rank[id] = 0;
    });
  
    const find = (node) => {
      if (parent[node] !== node) {
        parent[node] = find(parent[node]);
      }
      return parent[node];
    };
  
    const union = (node1, node2) => {
      const root1 = find(node1);
      const root2 = find(node2);
  
      if (root1 !== root2) {
        if (rank[root1] > rank[root2]) {
          parent[root2] = root1;
        } else if (rank[root1] < rank[root2]) {
          parent[root1] = root2;
        } else {
          parent[root2] = root1;
          rank[root1] += 1;
        }
      }
    };
  
    // Step 3: Construct MST
    const mstEdges = [];
    sortedEdges.forEach((edge) => {
      if (find(edge.source.id) !== find(edge.target.id)) {
        mstEdges.push(edge);
        union(edge.source.id, edge.target.id);
      }
    });
  
    // Highlight MST edges
    const svg = d3.select(svgRef.current);
    svg.selectAll(".mst-highlight").classed("mst-highlight", false); // Reset previous highlights
  
    mstEdges.forEach((edge) => {
      svg
        .selectAll("line")
        .filter((d) => d.source.id === edge.source.id && d.target.id === edge.target.id)
        .classed("mst-highlight", true);
    });
  
    setError(""); // Clear any previous error
  };
  
  
  return (
    <div className="graph-visualization-container">
      <h1>{isDirected ? "Directed" : "Undirected"} Graph Visualization</h1>
  
      {/* Toggle Buttons for Directed/Undirected */}
      <div className="button-container">
      {error && <div className="error-message">{error}</div>}
        <button
          className={`toggle-button ${isDirected ? "active" : ""}`}
          onClick={() => {
            setIsDirected(true);
            validateInput(input);
          }}
        >
          Directed
        </button>
        <button
          className={`toggle-button ${!isDirected ? "active" : ""}`}
          onClick={() => {
            setIsDirected(false);
            validateInput(input);
          }}
        >
          Undirected
        </button>
        
      </div>
  
      {/* Input and Download Section */}
      <div className="input-download-container">
        <textarea
          placeholder={`Enter edges (e.g., "1 2 3" for edge with weight 3) one per line`}
          onChange={handleInputChange}
          className="input-container"
          value={input}
          rows="5"
        ></textarea>
  
        <div className="download-container">
          <button className="download-button" onClick={downloadGraph}>
            <img src={db} alt="Download" className="download-icon" />
          </button>
          <p className="download-txt">Download Graph</p>
        </div>
       
      </div>
  
      {/* Error Message */}

  
      {/* Operations Section */}
      <div className="graphdislpay-button-wraper">
        <div className="operation-button-container">
          <button className="operation_button" onClick={handleDFS}>BFS</button>
          <button className="operation_button" onClick={handleBFS}>DFS</button>
          
          <button className="operation_button" onClick={handleTopoSort}>Topo Sort</button>
          
          {/* Shortest Path Button with Input */}
      <div>
      <button className="operation_button" onClick={handleGetPath}>
        Shortest Path
      </button>

      {/* Conditionally render the input fields */}
      {showShortestPathInputs && (
        <>
          <input
            className="shortestpathop"
            type="text"
            placeholder="Start Node"
            onChange={(e) =>
              setShortestPathInput({ ...shortestPathInput, startNode: e.target.value })
            }
            style={{ marginLeft: "10px" }}
          />
          <input
            className="shortestpathop"
            type="text"
            placeholder="End Node"
            onChange={(e) =>
              setShortestPathInput({ ...shortestPathInput, endNode: e.target.value })
            }
            style={{ marginLeft: "10px" }}
          />
          <button onClick={findShortestPath}>Get Path</button>
        </>
      )}
    </div>
          <button className="operation_button" onClick={handleMST}>MST</button>
          {topoSortResult && (
        <div className="operation-result">
          <h3>Topological Sort : </h3>
          <p>{topoSortResult}</p>
        </div>
      )}
  
      {shortestPathResult && (
        <div className="operation-result">
          <h3>Shortest Path : </h3>
          <p>{shortestPathResult}</p>
        </div>
      )}
        </div>
  
        {/* Graph Display */}
        <div
          className="graph-display"
          ref={graphContainerRef}
          style={{
            alignItems: "flex-end",
            overflow: "auto",
            maxWidth: "69%",
            height: "450px"
          }}
        >
          <svg ref={svgRef} width="1000" height="450" style={{ border: "1px solid black" }}></svg>
        </div>
      </div>
  
      {/* Results Section */}
      
    </div>
  );
  
};

export default GraphVisualization;
