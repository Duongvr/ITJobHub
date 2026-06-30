import React from 'react';
import Auth from '../../components/Auth/Auth';
import BackButton from '../../components/BackButton/BackButton';
import './AuthPage.css';

const AuthPage = () => {
  return (
    <div className="auth-page">
      <div className="auth-page-back">
        <BackButton to="/" label="Home" />
      </div>
      <Auth />
    </div>
  );
};

export default AuthPage;
