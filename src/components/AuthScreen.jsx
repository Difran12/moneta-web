import React, { useState } from 'react';
import { auth } from '../lib/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { useStore } from '../store/useStore';

export default function AuthScreen() {
  const { lang, t, showToast } = useStore();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        showToast(lang === 'en' ? 'Successfully logged in!' : 'Berhasil masuk!', 'success');
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
        showToast(lang === 'en' ? 'Account created successfully!' : 'Akun berhasil dibuat!', 'success');
      }
    } catch (err) {
      console.error(err);
      let errMsg = lang === 'en' ? 'An error occurred. Please try again.' : 'Terjadi kesalahan. Silakan coba lagi.';
      if (err.code === 'auth/invalid-credential') errMsg = lang === 'en' ? 'Invalid email or password.' : 'Email atau kata sandi salah.';
      if (err.code === 'auth/email-already-in-use') errMsg = lang === 'en' ? 'Email already in use.' : 'Email sudah terdaftar.';
      if (err.code === 'auth/weak-password') errMsg = lang === 'en' ? 'Password should be at least 6 characters.' : 'Kata sandi minimal 6 karakter.';
      
      // Append the actual Firebase error message so we can debug it
      setError(`${errMsg} (${err.code || err.message})`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', background: 'var(--bg-body)' }}>
      <div className="glass-card" style={{ padding: '2.5rem', width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '1.5rem', border: '1px solid var(--border-color)', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
        
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, background: 'linear-gradient(135deg, var(--accent-income), var(--accent-brand))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '0.5rem' }}>
            Moneta
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            {isLogin ? (lang === 'en' ? 'Welcome back! Sign in to continue.' : 'Selamat datang kembali! Masuk untuk melanjutkan.') : (lang === 'en' ? 'Create a new account to sync your data.' : 'Buat akun baru untuk sinkronisasi data.')}
          </p>
        </div>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--accent-expense)', padding: '0.75rem 1rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, textAlign: 'center', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@email.com"
              required
              style={{ width: '100%', padding: '0.75rem 1rem', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '10px', color: 'var(--text-primary)', outline: 'none', transition: 'border 0.2s ease' }}
            />
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              {lang === 'en' ? 'Password' : 'Kata Sandi'}
            </label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              style={{ width: '100%', padding: '0.75rem 1rem', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '10px', color: 'var(--text-primary)', outline: 'none', transition: 'border 0.2s ease' }}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{ 
              width: '100%', 
              padding: '0.85rem', 
              marginTop: '0.5rem',
              background: 'var(--accent-brand)', 
              color: 'white', 
              border: 'none', 
              borderRadius: '10px', 
              fontWeight: 700, 
              fontSize: '1rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              transition: 'opacity 0.2s ease, transform 0.1s ease'
            }}
          >
            {loading ? (lang === 'en' ? 'Loading...' : 'Memproses...') : (isLogin ? (lang === 'en' ? 'Sign In' : 'Masuk') : (lang === 'en' ? 'Register' : 'Daftar'))}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            {isLogin ? (lang === 'en' ? "Don't have an account? " : "Belum punya akun? ") : (lang === 'en' ? "Already have an account? " : "Sudah punya akun? ")}
            <button 
              type="button" 
              onClick={() => setIsLogin(!isLogin)}
              style={{ background: 'none', border: 'none', color: 'var(--accent-brand)', fontWeight: 700, cursor: 'pointer', padding: 0 }}
            >
              {isLogin ? (lang === 'en' ? 'Register' : 'Daftar') : (lang === 'en' ? 'Sign In' : 'Masuk')}
            </button>
          </span>
        </div>

      </div>
    </div>
  );
}
