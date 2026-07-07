import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

export default function GoogleAuthButton({ label = 'Continue with Google', className = '' }: { label?: string; className?: string }) {
  const navigate = useNavigate();
  const listenerRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      if (listenerRef.current) {
        window.removeEventListener('message', listenerRef.current);
      }
    };
  }, []);

  const handleMessage = (e: MessageEvent) => {
    if (!e.data || e.data.type !== 'kupat_google_auth') return;
    try {
      const payload = e.data.payload;
      const token = payload.token;
      const user = payload.user?.data?.user || payload.user || null;
      if (token) {
        localStorage.setItem('kupat_token', token);
        useAuthStore.setState({ token, isAuthenticated: true, user });
        // Optionally fetch user to refresh other stores
        // useAuthStore.getState().fetchUser();
        navigate('/');
      }
    } catch (err) {
      // ignore
    }
  };

  const openPopup = () => {
    const apiBase = import.meta.env.VITE_API_URL || '/api';
    const authUrl = `${apiBase}/auth/google/redirect`;
    // Register listener
    listenerRef.current = handleMessage;
    window.addEventListener('message', listenerRef.current, false);

    // Open popup
    const width = 600;
    const height = 700;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2.5;
    window.open(authUrl, 'kupat_google_auth', `width=${width},height=${height},left=${left},top=${top}`);
  };

  return (
    <button
      type="button"
      onClick={openPopup}
      className={`w-full flex items-center justify-center gap-3 border border-[#1e293b] bg-[#111928] hover:bg-[#0d1726] text-gray-200 px-4 py-3 rounded-xl text-sm transition-colors ${className}`}
    >
      <svg width="18" height="18" viewBox="0 0 48 48" className="flex-shrink-0" xmlns="http://www.w3.org/2000/svg">
        <path fill="#FFC107" d="M43.6 20.4H42V20H24v8h11.3C34.7 32.3 30.1 35 24 35c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.3 0 6.3 1.2 8.6 3.2l6-6C34.6 3.9 29.7 2 24 2 12.9 2 4 10.9 4 22s8.9 20 20 20c10 0 18.4-7.1 19.6-16.4.3-1.7.4-3.3.4-5.2 0-.7 0-1.3-.4-2.4z"/>
        <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 16 18.9 13 24 13c3.3 0 6.3 1.2 8.6 3.2l6-6C34.6 3.9 29.7 2 24 2 16.7 2 10.2 6.3 6.3 14.7z"/>
        <path fill="#4CAF50" d="M24 46c5.7 0 10.6-1.9 14.5-5.1l-6.9-5.6C30.3 36.7 27.3 38 24 38c-6.1 0-10.7-2.7-13.3-6.8l-6.6 5.1C6 39.8 14.1 46 24 46z"/>
        <path fill="#1976D2" d="M43.6 20.4H42V20H24v8h11.3c-1.1 3-3.3 5.4-6.3 7.1 0 0 10.6-3.5 14.6-14.7.3-1.7.4-3.3.4-5.2 0-.7 0-1.3-.4-2.4z"/>
      </svg>
      <span className="font-medium text-sm">{label}</span>
    </button>
  );
}
