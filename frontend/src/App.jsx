import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Admin from './pages/Admin';
import Shop from './pages/Shop';
// ... other imports

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin" element={<Admin />} />
        <Route path="/shop" element={<Shop />} />
      </Routes>
    </BrowserRouter>

    
  );
}

export default App;