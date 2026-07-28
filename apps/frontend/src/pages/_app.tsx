import type { AppProps } from 'next/app';
import '../styles/globals.css';
import { AuthProvider } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';
import { ToastProvider } from '../context/ToastContext';
import { Toast } from '../components/Toast';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ToastProvider>
      <AuthProvider>
        <CartProvider>
          <Component {...pageProps} />
          <Toast />
        </CartProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
