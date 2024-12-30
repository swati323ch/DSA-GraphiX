import React, { useState } from "react";
import "./TreeVisualisation.css";
import db from "./assets/Download_button.png";

const TreeVisualizer = () => {
  const [input, setInput] = useState('[1,2,3,4,5,null,8,null,null,6,7,9]');
  const [treeData, setTreeData] = useState(null);
  const [highlightedNodes, setHighlightedNodes] = useState([]);
  const [bfsQueue, setBfsQueue] = useState([]);
  const [inorderResult, setInorderResult] = useState([]);
  const [preorderResult, setPreorderResult] = useState([]);
  const [postorderResult, setPostorderResult] = useState([]);
  const [isBfsRunning, setIsBfsRunning] = useState(false);
  const [isTraversalRunning, setIsTraversalRunning] = useState(false);

  const buildTree = (arr) => {
    if (!arr.length) return null;
    const nodes = arr.map((value) =>
      value !== null ? { value, left: null, right: null } : null
    );
    for (let i = 0, j = 1; j < arr.length; i++) {
      if (nodes[i] !== null) {
        if (j < arr.length) nodes[i].left = nodes[j++];
        if (j < arr.length) nodes[i].right = nodes[j++];
      }
    }
    return nodes[0];
  };
  const handleVisualize = () => {
    try {
      const parsedArray = JSON.parse(input);
      setTreeData(buildTree(parsedArray));
    } catch (error) {
      alert("Invalid input format. Please enter a valid JSON array.");
    }
  };

  const bfsTraversalWithQueue = (node) => {
    setIsBfsRunning(true);
    setIsTraversalRunning(false);
    const queue = [node];
    const traversal = [];
    const visualQueue = [];

    while (queue.length > 0) {
      const current = queue.shift();
      if (current) {
        traversal.push(current.value);
        visualQueue.push([...queue.map((n) => n.value), current.value]);
        if (current.left) queue.push(current.left);
        if (current.right) queue.push(current.right);
      }
    }

    let index = 0;
    const interval = setInterval(() => {
      if (index < visualQueue.length) {
        setHighlightedNodes([traversal[index]]);
        setBfsQueue(visualQueue[index]);
        index++;
      } else {
        clearInterval(interval);
        setIsBfsRunning(false);
        setHighlightedNodes([]);
        setBfsQueue([]);
      }
    }, 1500);
  };

  const dfsTraversal = (node) => {
    const result = [];
    const dfs = (current) => {
      if (!current) return;
      result.push(current.value);
      dfs(current.left);
      dfs(current.right);
    };
    dfs(node);
    return result;
  };
  const resetTraversalResults = () => {
    setInorderResult([]);
    setPreorderResult([]);
    setPostorderResult([]);
  };
  
  const inorderTraversal = (node) => {
    resetTraversalResults(); // Reset results before starting
    setIsTraversalRunning(true);
    const result = [];
    const inorder = async (current) => {
      if (!current) return;
      await inorder(current.left);
      result.push(current.value);
      setHighlightedNodes([current.value]);
      setInorderResult((prev) => [...prev, current.value]);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await inorder(current.right);
    };
    inorder(node).then(() => setHighlightedNodes([]));
  };
  
  const preorderTraversal = (node) => {
    resetTraversalResults(); // Reset results before starting
    setIsTraversalRunning(true);
    const result = [];
    const preorder = async (current) => {
      if (!current) return;
      result.push(current.value);
      setHighlightedNodes([current.value]);
      setPreorderResult((prev) => [...prev, current.value]);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await preorder(current.left);
      await preorder(current.right);
    };
    preorder(node).then(() => setHighlightedNodes([]));
  };
  
  const postorderTraversal = (node) => {
    resetTraversalResults(); // Reset results before starting
    setIsTraversalRunning(true);
    const result = [];
    const postorder = async (current) => {
      if (!current) return;
      await postorder(current.left);
      await postorder(current.right);
      result.push(current.value);
      setHighlightedNodes([current.value]);
      setPostorderResult((prev) => [...prev, current.value]);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    };
    postorder(node).then(() => setHighlightedNodes([]));
  };
  
  const visualizeTraversal = (traversal) => {
    setIsBfsRunning(false);
    setIsTraversalRunning(true);
    let index = 0;
    const interval = setInterval(() => {
      if (index < traversal.length) {
        setHighlightedNodes([traversal[index]]);
        index++;
      } else {
        clearInterval(interval);
        setHighlightedNodes([]);
      }
    }, 1500);
  };

  const handleBFSVisualize = () => {
    if (!isBfsRunning && treeData) {
      bfsTraversalWithQueue(treeData);
    } else if (isBfsRunning) {
      alert("BFS is already running. Please wait for it to finish.");
    } else {
      alert("Please visualize the tree first.");
    }
  };

  const handleDFSVisualize = () => {
    const traversal = dfsTraversal(treeData);
    visualizeTraversal(traversal);
  };

  const handleDownload = () => {
    const svgElement = document.getElementById("treeCanvas");
    const svgData = new XMLSerializer().serializeToString(svgElement);
    const blob = new Blob([svgData], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "tree.svg";
    a.click();
  };

  const calculateTreeDepth = (node) => {
    if (!node) return 0;
    return 1 + Math.max(calculateTreeDepth(node.left), calculateTreeDepth(node.right));
  };

  const renderTree = (node, x, y, level, parentX = null, parentY = null) => {
    if (!node) return null;

    const horizontalSpacing = 3800 / Math.pow(2, level + 4);
    const leftChildX = x - horizontalSpacing;
    const rightChildX = x + horizontalSpacing;
    const childY = y + 100;

    return (
      <>
        {parentX !== null && (
          <line
            x1={parentX}
            y1={parentY + 28}
            x2={x}
            y2={y}
            stroke="black"
            strokeWidth="3"
          />
        )}
        <g className="circle-group">
          <circle
            cx={x}
            cy={y}
            r="25"
            className={
              highlightedNodes.includes(node.value)
                ? "highlighted-circle"
                : "tree-circle"
            }
          />
          <text
            x={x}
            y={y}
            textAnchor="middle"
            dy="5"
            fill="white"
            fontWeight="bold"
          >
            {node.value}
          </text>
        </g>
        {node.left && renderTree(node.left, leftChildX, childY, level + 1, x, y)}
        {node.right &&
          renderTree(node.right, rightChildX, childY, level + 1, x, y)}
      </>
    );
  };

  return (
    <div className="tree-visualizer-container">
      <h1 className="title">Tree Visualizer</h1>

      <div className="input-download-container">
        <textarea
          className="input-box"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter a level-order array, e.g., [1,2,3,4,5,null,8]"
        />
        <div className="download-container">
          <button className="download-button" onClick={handleDownload}>
            <img src={db} alt="Download" className="download-icon" />
          </button>
          <p className="download-text">Download Tree</p>
        </div>
      </div>

      <div className="button-container">
        <button className="visualize-button" onClick={handleVisualize}>
          Visualize Tree
        </button>
        <button className="bfs-button" onClick={handleBFSVisualize}>
          BFS
        </button>
        <button className="dfs-button" onClick={handleDFSVisualize}>
          DFS
        </button>
        <button
          className="dfs-button"
          onClick={() => inorderTraversal(treeData)}
        >
          Inorder
        </button>
        <button
          className="dfs-button"
          onClick={() => preorderTraversal(treeData)}
        >
          Preorder
        </button>
        <button
          className="dfs-button"
          onClick={() => postorderTraversal(treeData)}
        >
          Postorder
        </button>
      </div>

      {isBfsRunning && (
        <div className="queue-container">
          <h3 className="queue-title">
            BFS Queue:{" "}
            {bfsQueue.map((value, index) => (
              <span
                key={index}
                className={`queue-inline-item ${
                  highlightedNodes.includes(value) ? "red-queue-item" : ""
                }`}
              >
                {value}
              </span>
            ))}
          </h3>
        </div>
      )}

<div className="canvas-container">
  <svg
    id="treeCanvas"
    className="tree-canvas"
    viewBox={`0 0 1000 ${Math.max(100, 100 + calculateTreeDepth(treeData) * 100)}`}
  >
    {treeData && renderTree(treeData, 500, calculateTreeDepth(treeData) <= 3 ? 150 : 120, 0)}
  </svg>
</div>

      {isTraversalRunning && (
        <div className="traversal-result-container">
          {inorderResult.length > 0 && (
            <h3 className="queue-title">Inorder Traversal: {inorderResult.join(", ")}</h3>
          )}
          {preorderResult.length > 0 && (
            <h3 className="queue-title">Preorder Traversal: {preorderResult.join(", ")}</h3>
          )}
          {postorderResult.length > 0 && (
            <h3 className="queue-title">Postorder Traversal: {postorderResult.join(", ")}</h3>
          )}
        </div>
      )}
    </div>
  );
};

export default TreeVisualizer;
