import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { fetchRegionTimeseries } from '../services/api';
import TimeSeriesChart from './TimeSeriesChart';
import '../styles/Heatmap.css';

const TimeSeriesPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { patient, connectivity } = location.state || {};

    const [region, setRegion] = useState('');
    const [timeseries, setTimeseries] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!patient || !connectivity) {
            navigate('/diagnosis');
        }
    }, [patient, connectivity, navigate]);

    const handleRegionChange = async (e) => {
        const selectedRegion = e.target.value;
        setRegion(selectedRegion);
        if (!selectedRegion) return;

        setLoading(true);
        try {
            const tsData = await fetchRegionTimeseries(patient.patient_id, selectedRegion);
            setTimeseries(tsData);
        } catch (err) {
            console.error('Failed to load time series data:', err);
        } finally {
            setLoading(false);
        }
    };

    if (!patient || !connectivity) {
        return null;
    }

    return (
        <div className="heatmap-wrapper">
            <h2>Brain Signals for Patient {patient.patient_id}</h2>
            <label>Select Region: </label>
            <select value={region} onChange={handleRegionChange}>
                <option value="">-- Choose a Region --</option>
                {Object.keys(connectivity).map((regionKey) => (
                    <option key={regionKey} value={regionKey}>
                        {regionKey}
                    </option>
                ))}
            </select>

            {loading ? (
                <div className="centered-message">
                    <div className="spinner" />
                    <p>Loading time series data...</p>
                </div>
            ) : (
                region && <TimeSeriesChart timeseries={timeseries} region={region} />
            )}
        </div>
    );
};

export default TimeSeriesPage;
