import axios from 'axios';

export const fetchPatients = async (label) => {
    const response = await axios.get('/api/patients', {
        params: { label }
    });
    return response.data;
};

export const fetchConnectivity = async (patientId) => {
    const response = await axios.get(`/api/patient/${patientId}/connectivity`);
    return response.data;
};

export const fetchRegionTimeseries = async (patientId, region) => {
    const response = await axios.get(`/api/patient/${patientId}/region/${region}/timeseries`);
    return response.data;
};
