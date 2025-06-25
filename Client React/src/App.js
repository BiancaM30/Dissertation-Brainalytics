import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import MainPage from './components/MainPage';
import HeatmapPage from "./components/HeatmapPage";
import PacientDatabasePage from './components/PacientDatabasePage';
import TimeSeriesPage from "./components/TimeSeriePage";
import ComparatorPage from "./components/ComparatorPage";
import DiagnosisPage from "./components/DiagnosisPage";
import { ROUTES } from './routes';

function App() {
    return (
        <div className="app-container">
            <Router>
                <Routes>
                    <Route path={ROUTES.MAIN} element={<MainPage />} />
                    <Route path={ROUTES.RECORDS} element={<PacientDatabasePage />} />
                    <Route path={ROUTES.HEATMAP} element={<HeatmapPage />} />
                    <Route path={ROUTES.TIMESERIES} element={<TimeSeriesPage />} />
                    <Route path={ROUTES.COMPARE} element={<ComparatorPage />} />
                    <Route path={ROUTES.CLASSIFY} element={<DiagnosisPage />} />
                </Routes>
            </Router>
        </div>
    );
}

export default App;
