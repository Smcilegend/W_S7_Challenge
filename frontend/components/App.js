import React from 'react';
import { NavLink, Routes, Route } from 'react-router-dom'
import Home from './Home';
import Form from './Form';
import './App.css';

export default function App() {
  return (
    <div className="App">
    <nav>
      <NavLink to="/" end>Home</NavLink>
      <NavLink to="/order" end>Order</NavLink>
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