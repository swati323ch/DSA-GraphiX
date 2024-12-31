// MainPage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaLinkedin, FaGithub } from 'react-icons/fa'; // Import icons
import './mainpage.css'; // Ensure your CSS file is in the correct location
import heading from './assets/heading3.png'; // Fix the extra space in the path
import Background from './Background';

const MainPage = () => {
  const navigate = useNavigate();

  const handleVisualizerClick = () => {
    navigate('/visualizer');
  };

  return (
    <div className="mp">
      <Background />
      <div className="social-icons">
        <a href="https://www.linkedin.com/in/ch-swati/" target="_blank" rel="noopener noreferrer">
          <FaLinkedin className="icon" />
        </a>
        <a href="https://github.com/swati323ch" target="_blank" rel="noopener noreferrer">
          <FaGithub className="icon" />
        </a>
      </div>
      <img className="head" src={heading} alt="Letter Heading" style={{ height: '45px', width: 'auto', fill: 'white' }} />
      <div className="content-box">
        <p> "Visualize to Understand, Learn to Master!" </p>
        <p> The DSA Algorithm Visualizer is an innovative web application designed to make learning data structures and algorithms (DSA) engaging and intuitive. This interactive tool brings key concepts to life, allowing you to see algorithms in action and deepen their understanding. It offers features for visualizing Sorting Algorithms like Bubble Sort and Insertion Sort, Tree Operations such as BFS, DFS, and traversals (Inorder, Preorder, Postorder), and Graph Algorithms, including BFS, DFS, Topological Sort etc.</p>
        <p>Transform your learning experience and master DSA effortlessly!</p>
      </div>
      <button className="direct" onClick={handleVisualizerClick}>
        Get Started
      </button>
    </div>
  );
};

export default MainPage;
