import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchPatients, fetchConnectivity } from '../services/api';
import userIcon from '../images/User.png';
import '../styles/PacientDatabase.css';
import { ROUTES } from '../routes';

const PacientDatabasePage = () => {
    const [labelFilter, setLabelFilter] = useState('');
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const loadPatients = async () => {
            try {
                const data = await fetchPatients(labelFilter);
                setPatients(data);
            } catch (err) {
                console.error(err);
            }
        };
        loadPatients();
    }, [labelFilter]);

    const handleConnectivitySelect = async (patient) => {
        setLoadingMessage('Loading connectivity matrix...');
        setLoading(true);
        try {
            const connectivity = await fetchConnectivity(patient.patient_id);
            setTimeout(() => {
                navigate(ROUTES.HEATMAP, { state: { connectivity, patient } });
            }, 1000);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const handleTimeseriesSelect = async (patient) => {
        setLoadingMessage('Loading region timeseries...');
        setLoading(true);
        try {
            const connectivity = await fetchConnectivity(patient.patient_id);
            setTimeout(() => {
                navigate('/timeseries', { state: { connectivity, patient } });
            }, 1000);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="database-container">
            {loading ? (
                <div className="loading-overlay">
                    <div className="spinner" />
                    <p>{loadingMessage}</p>
                </div>
            ) : (
                <>
                    <div className="label-selector">
                        <label htmlFor="diagnosis">Select Diagnosis:</label>
                        <select id="diagnosis" value={labelFilter} onChange={(e) => setLabelFilter(e.target.value)}>
                            <option value=''>All</option>
                            <option value='AD'>Alzheimer's Disease</option>
                            <option value='MCI'>Mild Cognitive Impairment</option>
                            <option value='CN'>Healthy</option>
                        </select>
                    </div>

                    <div className="patient-card-list">
                        {patients.map((patient) => (
                            <div className="patient-card" key={patient.patient_id}>
                                <img src={userIcon} alt="User" className="patient-icon" />
                                <p><strong>ID:</strong> {patient.patient_id}</p>
                                <div className="card-actions">
                                    <button onClick={() => handleConnectivitySelect(patient)}>Connectivity</button>
                                    <button onClick={() => handleTimeseriesSelect(patient)}>Region Signals</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default PacientDatabasePage;
