import React from 'react';
import { useNavigate } from 'react-router-dom';
import heroImage from '../images/DoctorLogo.png';
import '../styles/Main.css';
import {ROUTES} from "../routes";

const MainPage = () => {
    const navigate = useNavigate();

    const features = [
        {
            title: 'Advanced Diagnosis',
            description: 'Upload your fMRI time series file and receive an instant AI-based diagnosis (Alzheimer vs. Healthy).',
            route: ROUTES.CLASSIFY,
        },
        {
            title: 'Patient Database',
            description: 'Browse and filter patient records to view detailed connectivity heatmaps and brain region signals.',
            route: ROUTES.RECORDS,
        },
        {
            title: 'Brain Signals Comparator',
            description: 'Plot and compare the brain signals from a specific region for two different patients.',
            route: ROUTES.COMPARE,
        },
    ];

    return (
        <div className="main-menu">
            {}
            <div className="top-hero">
                <img src={heroImage} alt="Hero" className="hero-img" />
            </div>

            <div className="bottom-section">
                <div className="cards-grid">
                    {features.map((feature, index) => (
                        <div
                            className={`card ${feature.disabled ? 'disabled' : ''}`}
                            key={index}
                        >
                            <h3>{feature.title}</h3>
                            <p>{feature.description}</p>
                            <button
                                onClick={() => !feature.disabled && navigate(feature.route)}
                                disabled={feature.disabled}
                            >
                                {feature.disabled ? 'Coming Soon' : 'Explore'}
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default MainPage;
