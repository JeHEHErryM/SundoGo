import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import PortalPage from './pages/PortalPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/portal" element={<PortalPage />} />
    </Routes>
  );
}
