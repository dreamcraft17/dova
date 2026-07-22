import Link from 'next/link';
import { ReactNode } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
export function Layout({ children }: { children: ReactNode }) { const { user, logout } = useAuth(); const { count } = useCart(); return <><header className="header"><Link href="/" className="brand">DOVA<span>●</span></Link><nav><Link href="/products">Marketplace</Link><Link href="/about">About</Link><Link href="/contact">Contact</Link><Link href="/cart">Cart{count>0&&<sup className="cart-count">{count}</sup>}</Link>{user ? <><Link href={user.role === 'admin' ? '/admin' : user.role === 'supplier' ? '/supplier' : '/customer'}>{user.fullName}</Link><button className="button small" onClick={() => void logout()}>Logout</button></> : <Link href="/auth/login" className="button small">Login</Link>}</nav></header><main>{children}</main><footer>© 2026 DOVA · Fresh supply, delivered with trust.</footer></>; }
