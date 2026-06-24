import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { SocketProvider } from './context/SocketContext';
import LoginPage from './pages/LoginPage';
import ChatPage from './pages/ChatPage';

const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
};

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <SocketProvider>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/" element={<PrivateRoute><ChatPage /></PrivateRoute>} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </SocketProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
