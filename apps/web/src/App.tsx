import { Routes, Route } from 'react-router-dom';
import { Entry } from './pages/Entry';
import { Simulator } from './pages/Simulator';
import { Debrief } from './pages/Debrief';

export function App() {
  return (
    <Routes>
      <Route path="/" element={<Entry />} />
      <Route path="/simulador" element={<Simulator />} />
      <Route path="/debrief" element={<Debrief />} />
    </Routes>
  );
}
