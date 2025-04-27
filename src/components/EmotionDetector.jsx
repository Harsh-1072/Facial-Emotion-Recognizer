import React, { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';
import './EmotionDetector.css';

function EmotionDetector() {
    const videoRef = useRef();
    const canvasRef = useRef();
    const [modelsLoaded, setModelsLoaded] = useState(false);
    const [error, setError] = useState(null);
    const [personCount, setPersonCount] = useState(0);
    const detectionInterval = useRef(null);

    useEffect(() => {
        loadModels();
        return () => {
            if (detectionInterval.current) {
                clearInterval(detectionInterval.current);
            }
            if (videoRef.current && videoRef.current.srcObject) {
                const tracks = videoRef.current.srcObject.getTracks();
                tracks.forEach(track => track.stop());
            }
        };
    }, []);

    const loadModels = async () => {
        try {
            setError(null);
            const MODEL_URL = '/models';
            console.log('Loading models...');
            await Promise.all([
                faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
                faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL)
            ]);
            console.log('Models loaded successfully.');
            setModelsLoaded(true);
            startVideo();
        } catch (error) {
            const errorMsg = 'Error loading face-api models: ' + error.message;
            setError(errorMsg);
            console.error(errorMsg, error);
        }
    };

    const startVideo = () => {
        console.log('Requesting camera access...');
        navigator.mediaDevices.getUserMedia({ video: {} })
            .then((stream) => {
                console.log('Camera access granted.');
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.muted = true;
                } else {
                    console.warn('Video ref not available when stream was ready.');
                }
            })
            .catch((err) => {
                const errorMsg = 'Error accessing camera: ' + err.message;
                setError(errorMsg + '. Please ensure camera permissions are allowed.');
                console.error(errorMsg, err);
            });
    };

    const handleVideoPlay = () => {
        if (!modelsLoaded) {
            console.log("Waiting for models to load before starting detection.");
            return;
        }
        if (detectionInterval.current) {
            clearInterval(detectionInterval.current);
        }
        console.log('Video playing, starting detection interval.');

        detectionInterval.current = setInterval(async () => {
            if (videoRef.current && videoRef.current.readyState >= 3 && canvasRef.current) {
                const video = videoRef.current;
                const canvas = canvasRef.current;

                canvas.width = video.clientWidth;
                canvas.height = video.clientHeight;

                const displaySize = { width: canvas.width, height: canvas.height };
                faceapi.matchDimensions(canvas, displaySize);

                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    console.error('Could not get canvas context');
                    return;
                }

                try {
                    const detections = await faceapi
                        .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions({ inputSize: 320 }))
                        .withFaceExpressions();

                    setPersonCount(detections.length);

                    ctx.clearRect(0, 0, canvas.width, canvas.height);

                    const resizedDetections = faceapi.resizeResults(detections, displaySize);

                    resizedDetections.forEach(detection => {
                        const box = detection.detection.box;
                        const emotions = detection.expressions;
                        const dominantEmotion = Object.keys(emotions).reduce((a, b) =>
                            emotions[a] > emotions[b] ? a : b
                        );
                        const score = Math.round(emotions[dominantEmotion] * 100);

                        ctx.strokeStyle = '#00ff00';
                        ctx.lineWidth = 2;
                        ctx.strokeRect(box.x, box.y, box.width, box.height);

                        const text = `${dominantEmotion} (${score}%)`;
                        ctx.font = '18px Arial';
                        ctx.fillStyle = '#00ff00';

                        const textX = box.x;
                        const textY = box.y > 10 ? box.y - 5 : 10;
                        ctx.fillText(text, textX, textY);
                    });

                } catch(detectionError) {
                     console.error("Error during face detection:", detectionError);
                }
            }
        }, 200);
    };

    useEffect(() => {
        return () => {
            if (detectionInterval.current) {
                clearInterval(detectionInterval.current);
            }
        };
    }, []);

    return (
        <div className="emotion-detector">
            {error && <div className="error-message">{error}</div>}
            <div className="video-container">
                <video
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    onPlay={handleVideoPlay}
                />
                <canvas ref={canvasRef} />
            </div>
            <div className="info-bar">
                <div className="status-indicator">
                    <span className={`status-dot ${modelsLoaded ? 'active' : ''}`}></span>
                    {modelsLoaded ? 'Model Active' : (error ? 'Model Error' : 'Loading Model...')}
                </div>
                <div className="person-count">
                    Persons Detected: {personCount}
                </div>
            </div>
        </div>
    );
}

export default EmotionDetector;
