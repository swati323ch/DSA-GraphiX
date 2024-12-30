import React, { useState, useEffect, useRef } from "react";
import "./BubbleSort.css"; 
import arrowUp from './assets/25637.png';

const BubbleSort = () => {
  const [array, setArray] = useState([]);
  const [i, setI] = useState(0);
  const [j, setJ] = useState(0);
  const [status, setStatus] = useState("");
  const [highlightLine, setHighlightLine] = useState(0); // For pseudocode line highlighting
  const timeouts = useRef([]);
  const isPausedRef = useRef(false); // Ref to track pause state
  const resumeState = useRef({ array: [], i: 0, j: 0 }); 

  const ANIMATION_DELAY = 1000; 

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
      // Resume sorting from the saved state
      step([...resumeState.current.array], resumeState.current.i, resumeState.current.j);
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
    setTimeout(() => step(parsedArray, 0, 0), 500); // Start the sorting process
  };

  const step = (currentArr, currentI, currentJ) => {
    if (isPausedRef.current || currentI >= currentArr.length) {
      if (currentI >= currentArr.length) {
        setStatus("Sorting complete!");
        setHighlightLine(0); // Reset the pseudocode highlight
      }
      return;
    }

    // Save the current state for resuming the animation
    resumeState.current = { array: currentArr, i: currentI, j: currentJ };

    if (currentJ < currentArr.length - 1 - currentI) {
      setHighlightLine(3); // Highlight the comparison in pseudocode
      if (currentArr[currentJ] > currentArr[currentJ + 1]) {
        setHighlightLine(4); // Highlight the swap operation
        [currentArr[currentJ], currentArr[currentJ + 1]] = [
          currentArr[currentJ + 1],
          currentArr[currentJ],
        ];
        updateArray(currentArr, currentJ, currentJ + 1);
      }

      setJ(currentJ + 1); // Move the inner pointer
      movePointer("j-pointer", currentJ + 1);

      let timeoutId = setTimeout(() => step([...currentArr], currentI, currentJ + 1), ANIMATION_DELAY);
      timeouts.current.push(timeoutId);
    } else {
      setHighlightLine(2); // Highlight the outer loop in pseudocode
      setI(currentI + 1);
      setJ(0); // Reset the inner loop pointer
      movePointer("i-pointer", currentI + 1);

      let timeoutId = setTimeout(() => step([...currentArr], currentI + 1, 0), ANIMATION_DELAY);
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
    <div className="bubble-sort-container">
      <h1>Bubble Sort</h1>
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

        <div id="visualization" style={{ display: "flex", gap: "10px", position: "relative" }}>
  {array.map((num, idx) => (
    <div
      key={idx}
      id={`box-${idx}`}
      className={`box ${idx >= array.length - i ? "sorted" : ""}`} // Add "sorted" class
    >
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
            "for (int i = 0; i < n - 1; i++) {", // Line 1
            "  for (int j = 0; j < n - i - 1; j++) {", // Line 2
            "    if (arr[j] > arr[j + 1]) {", // Line 3
            "      swap(arr[j], arr[j + 1]);", // Line 4
            "    }", // Line 5
            "  }", // Line 6
            "}", // Line 7
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

export default BubbleSort;
