import type { AppProps } from 'next/app';
import { GoogleOAuthProvider } from '@react-oauth/google';
import '../styles/globals.css';
import '../styles/dashboard-redesign.css';
import '../styles/mobile-first.css';
import { AuthProvider } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';
import { ToastProvider } from '../context/ToastContext';
import { Toast } from '../components/Toast';

const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim() ?? '';

function AppProviders({ children }: { children: React.ReactNode }) {
  const tree = (
    <ToastProvider>
      <AuthProvider>
        <CartProvider>
          {children}
          <Toast />
        </CartProvider>
      </AuthProvider>
    </ToastProvider>
  );
  if (!googleClientId) return tree;
  return <GoogleOAuthProvider clientId={googleClientId}>{tree}</GoogleOAuthProvider>;
}

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AppProviders>
      <Component {...pageProps} />
    </AppProviders>
  );
}
