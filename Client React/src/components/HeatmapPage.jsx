import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../styles/Heatmap.css';

const HeatmapMatrix = ({ connectivity, onRegionSelect, patient }) => {
    if (!connectivity) return <p>Loading connectivity data...</p>;

    const regionFromKeys = Object.keys(connectivity);
    const regionToKeys =
        regionFromKeys.length > 0 ? Object.keys(connectivity[regionFromKeys[0]]) : [];

    return (
        <div className="heatmap-container">
            <h3 className="heatmap-title">
                Functional Connectivity Matrix for patient {patient.patient_id}
            </h3>
            <div className="heatmap-scroll">
                <table className="heatmap-table" border="1">
                    <thead>
                    <tr>
                        <th className="heatmap-label">Region \ Region</th>
                        {regionToKeys.map((regionTo) => (
                            <th key={regionTo} className="heatmap-label">
                                {regionTo}
                            </th>
                        ))}
                    </tr>
                    </thead>
                    <tbody>
                    {regionFromKeys.map((regionFrom) => (
                        <tr key={regionFrom}>
                            <td className="heatmap-label">{regionFrom}</td>
                            {regionToKeys.map((regionTo) => {
                                const value = connectivity[regionFrom][regionTo];
                                return (
                                    <td
                                        key={regionTo}
                                        className="heatmap-cell"
                                        style={{
                                            backgroundColor: `rgba(151, 181, 181, ${Math.min(
                                                Math.abs(value),
                                                1
                                            )})`,
                                        }}
                                        onClick={() => onRegionSelect(regionFrom)}
                                        title={`From: ${regionFrom} To: ${regionTo}\nValue: ${value}`}
                                    >
                                        {value?.toFixed(2)}
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const HeatmapPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { connectivity, patient } = location.state || {};

    if (!connectivity || !patient) {
        return (
            <div className="heatmap-wrapper">
                <p>
                    No connectivity data provided. Please go back and select a patient.
                </p>
                <button onClick={() => navigate(-1)}>Go Back</button>
            </div>
        );
    }

    return (
        <div className="heatmap-wrapper">
            <HeatmapMatrix
                connectivity={connectivity}
                patient={patient}
                onRegionSelect={(region) => {
                    alert(`Region selected: ${region}`);
                }}
            />
        </div>
    );
};

export default HeatmapPage;
