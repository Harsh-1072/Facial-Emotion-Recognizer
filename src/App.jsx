import React, { useState } from 'react';
import EmotionDetector from './components/EmotionDetector';
import InstructionsModal from './components/InstructionsModal.jsx';
import './App.css';

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const userName = "Harsh Panchal";
  const userRollNo = "ROll no - 205123041";

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <div className="App">
      <div className="app-header">
        <h1>Emotion Detection</h1>
        <button onClick={openModal} className="instructions-button">
          Instructions
        </button>
      </div>

      <EmotionDetector />

      <div className="user-info">
        <h2>{userName}</h2>
        <p>{userRollNo}</p>
      </div>

      {isModalOpen && <InstructionsModal onClose={closeModal} />}
    </div>
  );
}

export default App;
