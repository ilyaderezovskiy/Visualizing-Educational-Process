import React from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import VisualizationPage from "./pages/VisualizationPage";
import MainPage from "./pages/MainPage";
import LoginPage from "./pages/LoginPage";

export default function App() {

  return (
    <>
    <Router>
        <Routes>
          <Route path='/' exact element={<LoginPage/>} />
          <Route path='/projects' element={<MainPage/>} />
          <Route path='/visualization' element={<VisualizationPage/>} />
        </Routes>
    </Router>
    </>
  );
}