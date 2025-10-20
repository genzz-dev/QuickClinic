import { Route, Routes } from 'react-router-dom';
import LoginPage from '../pages/public/LoginPage';
import RegisterPage from '../pages/public/RegisterPage';
import AnonymousRoute from './guards/AnonymousRoute';

export default function AuthRoutes({ registerError, setRegisterError, loginError, setLoginError }) {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <AnonymousRoute>
            <LoginPage error={loginError} setError={setLoginError} />
          </AnonymousRoute>
        }
      />
      <Route
        path="/register"
        element={
          <AnonymousRoute>
            <RegisterPage error={registerError} setError={setRegisterError} />
          </AnonymousRoute>
        }
      />
    </Routes>
  );
}
