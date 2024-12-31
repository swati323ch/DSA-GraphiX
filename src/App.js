import React, { useState } from 'react'; 
import { Routes, Route, useNavigate } from 'react-router-dom';
import './App.css';
import './InsertionSort.css';
import './BubbleSort.css';
import './GraphVisualization.css';
import './TreeVisualisation.css';
import InsertionSort from './InsertionSort';
import BubbleSort from './BubbleSort';
import GraphVisualization from './GraphVisualization';
import TreeVisualisation from './TreeVisualisation';
import MainPage from './mainpage';
import rightImage from './assets/image.svg';

const App = () => {
  return (
    <Routes>
      {/* Main menu route */}
      <Route path="/" element={<MainPage />} />

      {/* Visualization page route */}
      <Route path="/visualizer" element={<Visualizer />} />
    </Routes>
  );
};

const Visualizer = () => {
  const [visualizationType, setVisualizationType] = useState('');
  const navigate = useNavigate();

  const showSorting = (algorithm) => {
    setVisualizationType(algorithm);
  };

  return (
    <div className="App">
      <div>
        <div className="navbar">
      </div>
      <div className="algorithm-buttons">
      <div className="dropdown">
          <button className="nav-button">Sorting Algorithms</button>
          <div className="dropdown-content">
            <a href="#" onClick={() => showSorting('bubble')}>Bubble Sort</a>
            <a href="#" onClick={() => showSorting('insertion')}>Insertion Sort</a>
          </div>
        </div>
        <button className="nav-button" onClick={() => setVisualizationType('tree')}>Tree Visualization</button>
        <button className="nav-button" onClick={() => setVisualizationType('graph')}>Graph Visualization</button>
        <button className="nav-button" onClick={() => navigate('/')}>
          Back to Main Menu
        </button>
      </div>
      <div id="visualization-container">
        {visualizationType === 'bubble' && <BubbleSort />}
        {visualizationType === 'insertion' && <InsertionSort />}
        {visualizationType === 'graph' && <GraphVisualization />}
        {visualizationType === 'tree' && <TreeVisualisation />}
      </div>
      
      <img id="bottom-right-image" src={rightImage} />

      </div>
    </div>
  );
};

export default App;


/*
import React, { useState } from 'react';
import './App.css';
import './InsertionSort.css';
import './BubbleSort.css';
import './GraphVisualization.css';
import './TreeVisualisation.css';
import AnimatedBackground from './Background'; // Import animated background
import InsertionSort from './InsertionSort';
import BubbleSort from './BubbleSort';
import GraphVisualization from './GraphVisualization';
import TreeVisualisation from './TreeVisualisation';

function App() {
  const [visualizationType, setVisualizationType] = useState('');

  const showSorting = (algorithm) => {
    setVisualizationType(algorithm);
  };

  return (
    <div className="App">
      <AnimatedBackground /> 
      <div className="navbar">
        <h1>Algorithm Visualizer</h1>
      </div>
      <div className="algorithm-buttons">
        <div className="dropdown">
          <button className="nav-button">Sort</button>
          <div className="dropdown-content">
            <a href="#" onClick={() => showSorting('bubble')}>Bubble Sort</a>
            <a href="#" onClick={() => showSorting('insertion')}>Insertion Sort</a>
          </div>
        </div>
        <button className="nav-button" onClick={() => setVisualizationType('tree')}>Tree Visualization</button>
        <button className="nav-button" onClick={() => setVisualizationType('graph')}>Graph Visualization</button>
      </div>

      <div id="visualization-container">
        {visualizationType === 'bubble' && <BubbleSort />}
        {visualizationType === 'insertion' && <InsertionSort />}
        {visualizationType === 'graph' && <GraphVisualization />}
        {visualizationType === 'tree' && <TreeVisualisation />}
      </div>

      <img id="bottom-right-image" src="/assets/image.svg" alt="Bottom Right Image" />
      <img id="bottom-left-image" src="/assets/undraw_abstract_re_l9xy.svg" alt="Bottom Left Image" />
    </div>
  );
}

export default App;

*/ 
