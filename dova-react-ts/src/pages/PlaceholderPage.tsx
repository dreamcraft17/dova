import { Link } from 'react-router-dom';

export default function PlaceholderPage({ title, message }: { title: string; message: string }) {
  return (
    <div style={{minHeight:'100vh',display:'grid',placeItems:'center',padding:'32px',background:'#F3F5EE',color:'#12231C'}}>
      <div style={{maxWidth:'720px',width:'100%',padding:'32px',border:'1px solid rgba(3,31,23,.13)',borderRadius:'24px',background:'#E9EEE5'}}>
        <div style={{fontWeight:900,letterSpacing:'.12em',color:'#087F5B',fontSize:'.72rem'}}>DOVA CHAIN</div>
        <h1 style={{fontSize:'clamp(2rem,5vw,3.5rem)',margin:'12px 0'}}>{title}</h1>
        <p style={{color:'#718078',lineHeight:1.7}}>{message}</p>
        <Link to="/" style={{display:'inline-flex',marginTop:'20px',padding:'12px 18px',borderRadius:'12px',background:'#D4AF37',color:'#031F17',fontWeight:900,textDecoration:'none'}}>Back to DOVA</Link>
      </div>
    </div>
  );
}
