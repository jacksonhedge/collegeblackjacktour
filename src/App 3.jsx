import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/SupabaseAuthContext';
import { SleeperProvider } from './contexts/SleeperContext';
import ProtectedLayout from './layout/ProtectedLayout';
import LandingPage from './pages/LandingPage';
import SignUpForm from './components/auth/SignUpForm';
import LoginForm from './components/auth/LoginForm';
import BankingView from './pages/BankingView';
import MyLeagues from './pages/MyLeagues';
import SendMoney from './pages/SendMoney';
import Platforms from './pages/Platforms';
import Profile from './pages/Profile';

function App() {
  return (
    <AuthProvider>
      <SleeperProvider>
        <Router>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/signup" element={<SignUpForm />} />
            <Route path="/login" element={<LoginForm />} />

            {/* Protected routes */}
            <Route element={<ProtectedLayout />}>
              <Route path="/banking" element={<BankingView />} />
              <Route path="/leagues" element={<MyLeagues />} />
              <Route path="/send" element={<SendMoney />} />
              <Route path="/spend" element={<Platforms />} />
              <Route path="/profile" element={<Profile />} />
            </Route>
          </Routes>
        </Router>
      </SleeperProvider>
    </AuthProvider>
  );
}

export default App;
