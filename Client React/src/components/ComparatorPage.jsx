import React, { useEffect, useState } from 'react';
import { fetchPatients, fetchRegionTimeseries, fetchConnectivity } from '../services/api';
import '../styles/Comparator.css';
import TimeSeriesChartComparison from '../components/TimeSeriesChartComparison.jsx';

const ComparatorPage = () => {
    const [label1, setLabel1] = useState('');
    const [label2, setLabel2] = useState('');
    const [patients1, setPatients1] = useState([]);
    const [patients2, setPatients2] = useState([]);
    const [selectedPatient1, setSelectedPatient1] = useState('');
    const [selectedPatient2, setSelectedPatient2] = useState('');
    const [region, setRegion] = useState('');
    const [ts1, setTs1] = useState([]);
    const [ts2, setTs2] = useState([]);
    const [regionOptions, setRegionOptions] = useState([]);
    const [loadingRegions, setLoadingRegions] = useState(false);

    useEffect(() => {
        if (label1) fetchPatients(label1).then(setPatients1);
    }, [label1]);

    useEffect(() => {
        if (label2) fetchPatients(label2).then(setPatients2);
    }, [label2]);

    useEffect(() => {
        const loadRegions = async () => {
            if (selectedPatient1 && selectedPatient2) {
                setLoadingRegions(true);
                try {
                    const connectivity = await fetchConnectivity(selectedPatient1);
                    setRegionOptions(Object.keys(connectivity));
                } catch (err) {
                    console.error("Failed to load regions", err);
                } finally {
                    setLoadingRegions(false);
                }
            }
        };
        loadRegions();
    }, [selectedPatient1, selectedPatient2]);

    const handleCompare = async () => {
        if (!selectedPatient1 || !selectedPatient2 || !region) return;

        try {
            const [data1, data2] = await Promise.all([
                fetchRegionTimeseries(selectedPatient1, region),
                fetchRegionTimeseries(selectedPatient2, region)
            ]);
            setTs1(data1);
            setTs2(data2);
        } catch (err) {
            console.error("Failed to fetch timeseries data", err);
        }
    };

    return (
        <div className="comparison-container">
            <h2>Comparative Brain Signals Viewer</h2>
            <div className="selectors">
                <div>
                    <h4>Patient 1</h4>
                    <select value={label1} onChange={e => setLabel1(e.target.value)}>
                        <option value="">Select Diagnosis</option>
                        <option value="AD">Alzheimer's Disease</option>
                        <option value="MCI">Mild Cognitive Impairment</option>
                        <option value="CN">Healthy</option>
                    </select>
                    <select
                        value={selectedPatient1}
                        onChange={e => setSelectedPatient1(e.target.value)}
                    >
                        <option value="">Select Patient ID</option>
                        {patients1.map(p => (
                            <option key={p.patient_id} value={p.patient_id}>
                                {p.patient_id}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <h4>Patient 2</h4>
                    <select value={label2} onChange={e => setLabel2(e.target.value)}>
                        <option value="">Select Diagnosis</option>
                        <option value="AD">Alzheimer's Disease</option>
                        <option value="MCI">Mild Cognitive Impairment</option>
                        <option value="CN">Healthy</option>
                    </select>
                    <select
                        value={selectedPatient2}
                        onChange={e => setSelectedPatient2(e.target.value)}
                    >
                        <option value="">Select Patient ID</option>
                        {patients2.map(p => (
                            <option key={p.patient_id} value={p.patient_id}>
                                {p.patient_id}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <h4>Region</h4>
                    {loadingRegions ? (
                        <div className="loading-overlay" style={{ padding: '1rem' }}>
                            <div className="spinner" />
                            <p>Loading brain regions...</p>
                        </div>
                    ) : (
                        <>
                            <select
                                value={region}
                                onChange={e => setRegion(e.target.value)}
                                disabled={!regionOptions.length}
                            >
                                <option value="">Select Brain Region</option>
                                {regionOptions.map(r => (
                                    <option key={r} value={r}>
                                        {r}
                                    </option>
                                ))}
                            </select>
                            <button onClick={handleCompare} disabled={!region}>
                                Compare
                            </button>
                        </>
                    )}
                </div>
            </div>

            <div className="chart-section">
                {ts1.length > 0 && ts2.length > 0 && (
                    <TimeSeriesChartComparison
                        data1={ts1}
                        data2={ts2}
                        region={region}
                        patient1Id={selectedPatient1}
                        patient2Id={selectedPatient2}
                    />
                )}
            </div>
        </div>
    );
};

export default ComparatorPage;
