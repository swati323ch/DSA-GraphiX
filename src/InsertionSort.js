import React, { useState, useEffect, useRef } from "react";
import "./InsertionSort.css"; // Make sure to update the CSS for the styles
import arrowUp from './assets/25637.png';

const InsertionSort = () => {
  const [array, setArray] = useState([]);
  const [i, setI] = useState(0);
  const [j, setJ] = useState(0);
  const [status, setStatus] = useState("");
  const [highlightLine, setHighlightLine] = useState(0); // For pseudocode line highlighting
  const timeouts = useRef([]);
  const isPausedRef = useRef(false); // Ref to track pause state

  const ANIMATION_DELAY = 1000; // Delay between steps in milliseconds

  useEffect(() => {
    return () => {
      // Clear timeouts on unmount
      timeouts.current.forEach((timeout) => clearTimeout(timeout));
    };
  }, []);

  const resetSortingState = () => {
    isPausedRef.current = false;
    timeouts.current.forEach((timeout) => clearTimeout(timeout));
    timeouts.current = [];
    setArray([]);
    setI(0);
    setJ(0);
    setStatus("");
    setHighlightLine(0); // Reset the pseudocode highlighting
  };

  const togglePause = () => {
    isPausedRef.current = !isPausedRef.current;
    if (!isPausedRef.current) {
      // Resume sorting
      step([...array], i, j);
    }
  };

  const startSorting = (inputArray) => {
    resetSortingState();
    const parsedArray = inputArray.split(" ").map(Number);

    if (parsedArray.some(isNaN)) {
      alert("Please enter valid numbers separated by spaces.");
      return;
    }

    setArray(parsedArray);
    setStatus("Sorting...");
    setTimeout(() => step(parsedArray, 1, 0), 1000); // Start at the second element
  };

  const step = (currentArr, currentI, currentJ) => {
    if (isPausedRef.current || currentI >= currentArr.length) {
      if (currentI >= currentArr.length) {
        setStatus("Sorting complete!");
        setHighlightLine(0); // Reset the pseudocode highlight
      }
      return;
    }
    

    if (currentJ >= 0 && currentArr[currentJ] > currentArr[currentJ + 1]) {
      // Highlight the key comparison in the pseudocode
      setHighlightLine(4);

      // Swap logic
      setHighlightLine(5);
      [currentArr[currentJ], currentArr[currentJ + 1]] = [
        currentArr[currentJ + 1],
        currentArr[currentJ],
      ];
      updateArray(currentArr, currentJ, currentJ + 1);

      setJ(currentJ - 1); // Move the pointer
      movePointer("j-pointer", currentJ - 1);

      let timeoutId = setTimeout(() => step([...currentArr], currentI, currentJ - 1), ANIMATION_DELAY);
      timeouts.current.push(timeoutId);
    } else {
      // Highlight the placement of the key in pseudocode
      setHighlightLine(8); // Line that places the key

      // Move to the next outer loop iteration
      setI(currentI + 1);
      setJ(currentI); // Reset the inner loop pointer to i
      movePointer("i-pointer", currentI);

      // Mark the element as sorted
      document.getElementById(`box-${currentI}`).classList.add("sorted");

      let timeoutId = setTimeout(() => step([...currentArr], currentI + 1, currentI), ANIMATION_DELAY);
      timeouts.current.push(timeoutId);
    }
  };

  const updateArray = (newArr, index1, index2) => {
    setArray([...newArr]);

    const box1 = document.getElementById(`box-${index1}`);
    const box2 = document.getElementById(`box-${index2}`);

    if (box1 && box2) {
      box1.classList.add("highlight");
      box2.classList.add("highlight");

      setTimeout(() => {
        box1.classList.remove("highlight");
        box2.classList.remove("highlight");
      }, ANIMATION_DELAY);
    }
  };

  const movePointer = (pointerId, index) => {
    const pointer = document.getElementById(pointerId);
    if (pointer) {
      if (index === -1) {
        pointer.style.display = "none"; // Hide pointer
      } else {
        pointer.style.display = "block"; // Show pointer
        pointer.innerHTML = `
          <img src="${arrowUp}" alt="arrow" style="width: 24px; height: 24px;" />
          <br/> ${pointerId[0]} = ${index}`;
        const box = document.getElementById(`box-${index}`);
        if (box) {
          pointer.style.left = `${box.offsetLeft + box.offsetWidth / 2 - 12}px`;
          pointer.style.top = `${box.offsetTop + box.offsetHeight + 10}px`; // Below the tile
        }
      }
    }
  };

  return (
    <div className="insertion-sort-container">
      <h1>Insertion Sort</h1>
      <div className="controls">
        <input
          id="arrayInput"
          type="text"
          placeholder="Enter numbers separated by space"
        />
      </div>
      <button onClick={() => startSorting(document.getElementById("arrayInput").value)}>
          Start Sorting
        </button>
        <button onClick={togglePause}>
          {isPausedRef.current ? "Resume Animation" : "Pause Animation"}
        </button>

      <div id="visualization" style={{ display: "block",margin: "auto", gap: "10px", position: "relative" }}>
        {array.map((num, idx) => (
          <div key={idx} id={`box-${idx}`} className="box">
            {num}
          </div>
        ))}
        <div id="i-pointer" className="pointer">i</div>
        <div id="j-pointer" className="pointer">j</div>
      </div>

      <div id="status">{status}</div>

      {/* Algorithm Display */}
      <pre id="algorithm" className="algorithm-display">
        <code>
          {[
            "for (int i = 1; i < n; i++) {",
            "  int key = arr[i];",
            "  int j = i - 1;",
            "  while (j >= 0 && arr[j] > key) {",
            "    arr[j + 1] = arr[j];",
            "    j--; ",
            "  }",
            "  arr[j + 1] = key;",
            "} "
          ].map((line, idx) => (
            <div key={idx} className={highlightLine === idx + 1 ? "highlight-text" : ""}>
              {line}
            </div>
          ))}
        </code>
      </pre>
    </div>
  );
};

export default InsertionSort;
