import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/Diagnosis.css';
import brainScan from '../images/BrainScan.png';

const DiagnosisPage = () => {
    const [file, setFile] = useState(null);
    const [prediction, setPrediction] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        setFile(selectedFile);
        setPrediction('');
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            setError('Please select a file.');
            return;
        }
        setLoading(true);
        setPrediction('');
        setError('');

        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await axios.post('/api/infer', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setPrediction(res.data.label);
        } catch (err) {
            console.error('Error during inference:', err);
            setError('Error during inference. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        navigate('/');
    };

    return (
        <div className="diagnosis-container">
            <div className="image-section">
                <img src={brainScan} alt="Brain Scan" className="scan-image" />
            </div>

            <div className="form-section">
                <h2>Upload and Classify</h2>

                <form onSubmit={handleSubmit} className="upload-form">
                    <div className="file-input-container">
                        <input
                            id="file-upload"
                            type="file"
                            accept=".txt"
                            onChange={handleFileChange}
                            style={{ display: 'none' }}
                        />
                        <label htmlFor="file-upload" className="custom-file-label">
                            {file ? file.name : 'Choose file'}
                        </label>
                    </div>

                    <div className="submit-container">
                        <button type="submit" className="upload-button">
                            Submit
                        </button>
                    </div>
                </form>

                {loading && (
                    <div className="loading-section">
                        <div className="spinner"></div>
                        <p>Processing file, please wait...</p>
                    </div>
                )}
                {error && <p className="error-message">{error}</p>}
                {prediction && !loading && (
                    <div className="result-section">
                        <p>
                            Predicted diagnostic: <strong>{prediction}</strong>
                        </p>
                        <button onClick={handleBack} className="back-button">Back to Menu</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DiagnosisPage;
