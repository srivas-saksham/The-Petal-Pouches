import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Admin from './pages/Admin';
// ... other imports

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </BrowserRouter>

    
  );
}

export default App;