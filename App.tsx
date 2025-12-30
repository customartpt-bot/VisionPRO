import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import MatchList from './components/MatchList';
import MatchForm from './components/MatchForm';
import AnalysisConsole from './components/AnalysisConsole';
import CoachDashboard from './components/CoachDashboard';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Verifica se existe um role guardado (login efetuado)
  const role = localStorage.getItem('userRole');
  return role ? <>{children}</> : <Navigate to="/" />;
};

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        
        <Route path="/matches" element={
          <PrivateRoute>
            <MatchList />
          </PrivateRoute>
        } />
        
        <Route path="/matches/new" element={
          <PrivateRoute>
            <MatchForm />
          </PrivateRoute>
        } />

        <Route path="/matches/:id/edit" element={
          <PrivateRoute>
            <MatchForm />
          </PrivateRoute>
        } />

        <Route path="/matches/:id/console" element={
          <PrivateRoute>
            <AnalysisConsole />
          </PrivateRoute>
        } />

        <Route path="/dashboard/:id" element={
          <PrivateRoute>
             <CoachDashboard />
          </PrivateRoute>
        } />
      </Routes>
    </HashRouter>
  );
}

export default App;