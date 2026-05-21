import { useAuth } from '../context/AuthContext';
import EmailNoVerificado from '../pages/EmailNoVerificado';

const EmailVerificationRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <p>Cargando...</p>
      </div>
    );
  }

  if (!user) {
    return children;
  }

  if (user?.email_verificado === false) {
    return <EmailNoVerificado />;
  }

  return children;
};

export default EmailVerificationRoute;