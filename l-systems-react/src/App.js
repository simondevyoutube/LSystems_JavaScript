import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';

import { Simple } from './pages/Simple';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <nav>
          <ul>
            <li>
              <Link to="/simple">Simple Example</Link>
            </li>
          </ul>
        </nav>
        <Routes>
          <Route path="/simple" element={<Simple />}></Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
