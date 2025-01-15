import React from 'react';
import { NavLink, Routes, Route } from 'react-router-dom'
import Home from './Home';
import Form from './Form';
import './App.css';

function App() {
  return (
    <div className="App">
      <nav>
        <NavLink
          to="/"
          end
          className={({ isActive }) => (isActive ? 'active' : undefined)}
        >
          Home
        </NavLink>
        <NavLink
          to="/order"
          className={({ isActive }) => (isActive ? 'active' : undefined)}
        >
          Order
        </NavLink>
      </nav>
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/order" element={<Form />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
