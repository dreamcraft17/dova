import { useMemo, useState, type ChangeEvent, type MouseEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import StorefrontLayout from '../../layouts/StorefrontLayout';

type Product = {
  name: string;
  category: 'flour' | 'coming';
  label: string;
  meta: string;
  status: string;
  price?: string;
  pack: string;
};

const products: Product[] = [
  { name: 'Plantain Flour', category: 'flour', label: 'Starting Product', meta: 'Food Flour · Select pack size', price: '₦ —', status: 'Live price & stock from backend', pack: 'DOVA CHAIN\\n\\nPLANTAIN\\nFLOUR' },
  { name: 'Cassava Flour', category: 'coming', label: 'Coming Soon', meta: 'Food Flour', status: 'Coming Soon', pack: 'DOVA CHAIN\\n\\nCASSAVA\\nFLOUR' },
  { name: 'Yam Flour', category: 'coming', label: 'Coming Soon', meta: 'Food Flour', status: 'Coming Soon', pack: 'DOVA CHAIN\\n\\nYAM\\nFLOUR' },
  { name: 'More Food Products', category: 'coming', label: 'In Development', meta: 'Expanding category', status: 'In Development', pack: 'MORE\\nFOOD\\nPRODUCTS' },
];

function ProductCard({ product }: { product: Product }) {
  const navigate = useNavigate();
  const available = product.category === 'flour';
  return (
    <Link className="card" data-cat={product.category} data-name={product.name.toLowerCase()} to={available ? '/product' : '#'}>
      <div className="visual">
        <span className="badge">{product.label}</span>
        <div className="pack">
          {product.pack.split('\n').map((line, index, lines) => (
            <span key={index}>{line}{index < lines.length - 1 ? <br /> : null}</span>
          ))}
        </div>
      </div>
      <div className="body">
        <div className="row">
          <div>
            <h3>{product.name}</h3>
            <div className="meta">{product.meta}</div>
          </div>
          <button
            className="plus"
            type="button"
            onClick={(event: MouseEvent<HTMLButtonElement>) => {
              event.preventDefault();
              if (available) navigate('/product');
            }}
          >
            +
          </button>
        </div>
        {product.price ? <div className="price">{product.price}</div> : null}
        <span className="status">{product.status}</span>
      </div>
    </Link>
  );
}

function MarketplaceContent() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState('featured');

  const visibleProducts = useMemo(() => {
    const filtered = products.filter((product) => {
      const matchesCategory = category === 'all' || product.category === category;
      const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase());
      return matchesCategory && matchesSearch;
    });
    if (sort === 'name') return [...filtered].sort((a, b) => a.name.localeCompare(b.name));
    return filtered;
  }, [search, category, sort]);

  return (
    <>
<section className="hero">
  <div className="container hero-grid">
    <div>
      <div className="eyebrow">
        DOVA Marketplace
      </div>
      <h1>
        Food products, sourced and delivered with purpose.
      </h1>
      <p>
        Start with Plantain Flour. Discover the products DOVA is currently building, with future categories clearly marked as they develop.
      </p>
      <div style={{"display": "flex", "gap": "8px", "marginTop": "20px"}}>
        <Link className="btn gold" to="#products">
          Shop Plantain Flour
        </Link>
        <Link className="btn outline" style={{"borderColor": "rgba(255,255,255,.25)", "color": "#fff"}} to="/bundles">
          Explore Bundles
        </Link>
      </div>
    </div>
    <div className="hero-art">
      <div className="flow">
        <b>
          SOURCE
        </b>
        <span>
          →
        </span>
        <b>
          PROCESS
        </b>
        <span>
          →
        </span>
        <b>
          PACKAGE
        </b>
        <span>
          →
        </span>
        <b>
          FULFILL
        </b>
      </div>
    </div>
  </div>
</section>
      <section className="section" id="products">
        <div className="container">
          <div className="section-head">
            <div>
              <div className="eyebrow">Marketplace</div>
              <h2>Explore DOVA products</h2>
            </div>
            <p>Compact product cards keep discovery fast. On mobile, products remain two per row rather than becoming oversized single cards.</p>
          </div>
          <div className="notice">Plantain Flour is the current commercial focus. Products without live inventory are clearly marked instead of showing invented prices or availability.</div>
          <div className="toolbar">
            <input
              className="search"
              value={search}
              onChange={(event: ChangeEvent<HTMLInputElement>) => setSearch(event.target.value)}
              placeholder="Search flour, food products, bundles…"
              aria-label="Search products"
            />
            <select className="select" value={category} onChange={(event: ChangeEvent<HTMLSelectElement>) => setCategory(event.target.value)}>
              <option value="all">All categories</option>
              <option value="flour">Flour</option>
              <option value="coming">Coming Soon</option>
            </select>
            <select className="select" value={sort} onChange={(event: ChangeEvent<HTMLSelectElement>) => setSort(event.target.value)}>
              <option value="featured">Featured</option>
              <option value="name">Name</option>
            </select>
          </div>
          <div className="pills">
            {[
              ['all', 'All'],
              ['flour', 'Flour'],
              ['coming', 'Coming Soon'],
            ].map(([value, label]) => (
              <button key={value} type="button" className={`pill ${category === value ? 'active' : ''}`} onClick={() => setCategory(value)}>
                {label}
              </button>
            ))}
          </div>
          <div className="grid2" id="productGrid" style={{marginTop:'14px'}}>
            {visibleProducts.map((product) => <ProductCard key={product.name} product={product} />)}
          </div>
        </div>
      </section>
    </>
  );
}

export default function Marketplace() {
  return <StorefrontLayout><MarketplaceContent /></StorefrontLayout>;
}
