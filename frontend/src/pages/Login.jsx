import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Lock, Mail, Loader2, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const { login, loading } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email || !password) {
      setErrorMessage('Please enter your administrator email and password.');
      return;
    }

    const res = await login(email, password);
    if (res.success) {
      showSuccess(`Welcome back, ${res.user.name || 'Admin'}!`);
      navigate('/admin/dashboard');
    } else {
      setErrorMessage(res.error);
      showError(res.error);
    }
  };

  const fillNagarjunAdmin = () => {
    setEmail('myakalanagarjun09@gmail.com');
    setPassword('naga@012');
    setErrorMessage('');
  };

  const fillDemoAdmin = () => {
    setEmail('admin@intiruchi.com');
    setPassword('admin123');
    setErrorMessage('');
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#090d16',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background glow accents */}
      <div style={{
        position: 'absolute',
        top: '-15%',
        right: '-10%',
        width: '500px',
        height: '500px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(234, 88, 12, 0.15) 0%, rgba(0,0,0,0) 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-15%',
        left: '-10%',
        width: '500px',
        height: '500px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(2, 132, 199, 0.12) 0%, rgba(0,0,0,0) 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{
        width: '100%',
        maxWidth: '440px',
        backgroundColor: '#0f172a',
        borderRadius: '24px',
        border: '1px solid #1e293b',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        padding: '40px',
        position: 'relative',
        zIndex: 10,
        animation: 'fadeIn 0.3s ease-out',
      }}>
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '18px',
            background: 'linear-gradient(135deg, #ea580c, #f97316)',
            margin: '0 auto 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2rem',
            boxShadow: '0 8px 20px rgba(234, 88, 12, 0.4)',
          }}>
            🍲
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
            INTI RUCHI
          </h2>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: '#1e293b',
            padding: '4px 12px',
            borderRadius: '9999px',
            color: '#ea580c',
            fontSize: '0.75rem',
            fontWeight: 700,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            marginTop: '8px',
          }}>
            <ShieldCheck size={14} />
            Administrator Portal
          </div>
          <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '12px' }}>
            Authorized restaurant management access only
          </p>
        </div>

        {/* Error alert */}
        {errorMessage && (
          <div style={{
            padding: '12px 16px',
            backgroundColor: '#450a0a',
            border: '1px solid #7f1d1d',
            borderRadius: '10px',
            color: '#fca5a5',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '20px',
          }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '6px' }}>
              Administrator Email
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} color="#64748b" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="email"
                required
                placeholder="myakalanagarjun09@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
                style={{
                  paddingLeft: '40px',
                  backgroundColor: '#1e293b',
                  borderColor: '#334155',
                  color: '#ffffff',
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '6px' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} color="#64748b" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
                style={{
                  paddingLeft: '40px',
                  backgroundColor: '#1e293b',
                  borderColor: '#334155',
                  color: '#ffffff',
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{
              padding: '12px',
              fontSize: '0.95rem',
              fontWeight: 700,
              marginTop: '8px',
              backgroundColor: '#ea580c',
            }}
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : (
              <>
                <span>Sign In to Admin Panel</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* Quick Fill helper */}
        <div style={{
          marginTop: '28px',
          padding: '16px',
          backgroundColor: '#1e293b',
          borderRadius: '12px',
          border: '1px dashed #334155',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Nagarjun Admin Credentials
          </div>
          <div style={{ fontSize: '0.8rem', color: '#cbd5e1', marginTop: '4px' }}>
            <code>myakalanagarjun09@gmail.com</code> / <code>naga@012</code>
          </div>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '10px' }}>
            <button
              type="button"
              onClick={fillNagarjunAdmin}
              style={{
                background: '#ea580c',
                border: 'none',
                borderRadius: '6px',
                color: '#ffffff',
                fontSize: '0.775rem',
                fontWeight: 700,
                padding: '6px 14px',
                cursor: 'pointer',
              }}
            >
              ⚡ Auto-Fill Nagarjun
            </button>
            <button
              type="button"
              onClick={fillDemoAdmin}
              style={{
                background: 'transparent',
                border: '1px solid #64748b',
                borderRadius: '6px',
                color: '#94a3b8',
                fontSize: '0.775rem',
                fontWeight: 600,
                padding: '6px 10px',
                cursor: 'pointer',
              }}
            >
              Demo Admin
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
