import React from 'react';
import './InstructionsModal.css';

function InstructionsModal({ onClose }) {
  const handleContentClick = (e) => {
    e.stopPropagation();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={handleContentClick}>
        <button className="modal-close-btn" onClick={onClose}>
          ×
        </button>

        <h3>How to Use Emotion Detection</h3>

        <ul>
          <li>Ensure your camera is enabled and permissions are granted when prompted.</li>
          <li>Position your face clearly within the camera view.</li>
          <li>Good lighting conditions improve detection accuracy.</li>
          <li>The application will detect faces and display the dominant emotion detected for each face.</li>
          <li>The number of detected persons is shown below the video feed.</li>
          <li>Make natural facial expressions to see the detection change.</li>
        </ul>

        <p><strong>Note:</strong> Detection accuracy can vary based on face angle, lighting, obstructions, and model limitations.</p>
      </div>
    </div>
  );
}

export default InstructionsModal;
