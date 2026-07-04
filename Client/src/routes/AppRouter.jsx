import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout/MainLayout';
import HomePage from '../pages/HomePage/HomePage';
import JobsPage from '../pages/JobsPage/JobsPage';
import JobDetailsPage from '../pages/JobDetailsPage/JobDetailsPage';
import AboutPage from '../pages/AboutPage/AboutPage';
import AuthPage from '../pages/AuthPage/AuthPage';

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Pages with Navbar & Footer */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/jobs" element={<JobsPage />} />
          <Route path="/jobs/:jobId" element={<JobDetailsPage />} />
          <Route path="/about" element={<AboutPage />} />
        </Route>

        {/* Auth page – standalone (no Navbar/Footer) */}
        <Route path="/auth" element={<AuthPage />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
