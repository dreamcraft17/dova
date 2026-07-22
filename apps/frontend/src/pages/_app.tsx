import type { AppProps } from 'next/app';
import '../styles/globals.css';
import { AuthProvider } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';
export default function App({ Component, pageProps }: AppProps) { return <AuthProvider><CartProvider><Component {...pageProps} /></CartProvider></AuthProvider>; }
