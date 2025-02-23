import React from'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './components/home'
import Analyze from './components/analyze'
import './App.css'

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/analyze' element={<Analyze />} />
      </Routes>
    </Router>
  );
};

export default App;