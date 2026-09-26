import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import StorefrontLayout from '../../layouts/StorefrontLayout';
import { addToMockCart, submitMockReview } from '../../services/mockApi';

function ProductMain() {
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [pack, setPack] = useState('500g');
  const [message, setMessage] = useState('Connect purchase actions to the existing cart/API.');

  const addToCart = async () => {
    await addToMockCart({ product: 'Plantain Flour', pack, quantity });
    setMessage(`Plantain Flour (${pack}) selected, quantity ${quantity}. Connect this action to the live DOVA cart/API.`);
  };

  return (
    <section className="section">
      <div className="container">
        <div className="eyebrow">Products / Flour / Plantain Flour</div>
        <div className="product-main" style={{marginTop:'12px'}}>
          <div>
            <div className="gallery">
              <span className="badge">Starting Product</span>
              <div className="pack">DOVA CHAIN<br/><br/>PLANTAIN<br/>FLOUR<br/><small>FINAL PRODUCT IMAGE</small></div>
            </div>
            <div className="thumbs">
              <div className="thumb">Front</div>
              <div className="thumb">Back</div>
              <div className="thumb">Pack</div>
              <div className="thumb">Detail</div>
            </div>
          </div>
          <div>
            <div className="eyebrow">DOVA · Food Flour</div>
            <h1>Plantain Flour</h1>
            <p style={{color:'var(--muted)',fontSize:'.78rem'}}>DOVA's first commercial food product focus, presented with the product, purchase and fulfillment information customers need.</p>
            <div className="rating"><b>★★★★★</b><small>No ratings yet · <a href="#reviews">Be the first to rate</a></small></div>
            <div className="pricebig">₦ —</div>
            <small style={{color:'var(--muted)',fontSize:'.61rem'}}>Live price should be returned by the product backend.</small>
            <h4 style={{fontSize:'.7rem',margin:'22px 0 8px'}}>Pack size</h4>
            <div className="variants">
              {['500g','1kg','2kg'].map((size) => (
                <button key={size} type="button" className={`variant ${pack === size ? 'active' : ''}`} onClick={() => setPack(size)}>{size}</button>
              ))}
            </div>
            <h4 style={{fontSize:'.7rem',margin:'22px 0 8px'}}>Quantity</h4>
            <div className="purchase">
              <div className="qty">
                <button type="button" onClick={() => setQuantity((value) => Math.max(1, value - 1))}>−</button>
                <input aria-label="Quantity" value={quantity} onChange={(event: ChangeEvent<HTMLInputElement>) => setQuantity(Math.max(1, Number(event.target.value) || 1))} />
                <button type="button" onClick={() => setQuantity((value) => value + 1)}>+</button>
              </div>
              <button className="btn green" type="button" onClick={addToCart}>Add to Cart</button>
              <button className="btn gold" type="button" onClick={() => navigate('/cart')}>View Cart</button>
            </div>
            <div id="msg" style={{fontSize:'.62rem',color:'var(--muted)',marginTop:'8px'}}>{message}</div>
            <div className="features">
              <div className="feature"><b>Product clarity</b><span>Pack, price and stock information.</span></div>
              <div className="feature"><b>Quality focus</b><span>Product details before purchase.</span></div>
              <div className="feature"><b>Secure checkout</b><span>Use the existing payment flow.</span></div>
              <div className="feature"><b>Fulfillment</b><span>Delivery information before checkout.</span></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ProductInformation() {
  return (
<section className="section">
  <div className="container">
    <div className="detail">
      <div className="panel">
        <h3>
          Product information
        </h3>
        <p>
          Approved product specifications should populate the live version of this section.
        </p>
        <ul>
          <li>
            Ingredients
          </li>
          <li>
            Nutrition information
          </li>
          <li>
            Allergen information
          </li>
          <li>
            Storage instructions
          </li>
          <li>
            Shelf life
          </li>
          <li>
            Packaging and batch information
          </li>
        </ul>
      </div>
      <div className="panel">
        <h3>
          Delivery & returns
        </h3>
        <p>
          Show the delivery option, estimated fulfillment information, returns/refunds policy and support route before the customer completes checkout.
        </p>
        <Link className="btn outline" to="/contact">
          Need help?
        </Link>
      </div>
    </div>
  </div>
</section>
  );
}

function Reviews() {
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewName, setReviewName] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [rating, setRating] = useState(0);

  const submitReview = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const finalRating = rating || 5;
    await submitMockReview({ name: reviewName, rating: finalRating, text: reviewText });
    setRating(finalRating);
    setReviewSubmitted(true);
    setReviewOpen(false);
  };

  return (
    <section className="section" id="reviews">
      <div className="container">
        <div className="section-head">
          <h2>Customer ratings & reviews</h2>
          <p>No fake ratings. In production, reviews should be tied to customer orders/accounts so verified-purchase status can be shown.</p>
        </div>
        <div className="reviews">
          <aside className="review-summary">
            <div className="eyebrow">Rating overview</div>
            <div className="big">{reviewSubmitted ? '5.0' : '—'}</div>
            <div style={{color:'var(--gold)'}}>★★★★★</div>
            <p style={{fontSize:'.65rem',color:'rgba(255,255,255,.6)'}}>{reviewSubmitted ? '1 rating' : 'No ratings yet'}</p>
            <button className="btn gold" type="button" onClick={() => setReviewOpen(true)}>Write a review</button>
          </aside>
          <div>
            <div id="reviewList">
              {reviewSubmitted ? (
                <div className="review">
                  <strong>{reviewName}</strong>
                  <div style={{color:'var(--gold)',marginTop:'4px'}}>{'★'.repeat(rating || 5)}</div>
                  <p>{reviewText}</p>
                </div>
              ) : (
                <div className="panel">
                  <strong>No reviews yet.</strong>
                  <p>Be the first customer to share your experience.</p>
                </div>
              )}
            </div>
            {reviewOpen ? (
              <form className="form" onSubmit={submitReview}>
                <div className="field">
                  <label>Your name</label>
                  <input value={reviewName} onChange={(event: ChangeEvent<HTMLInputElement>) => setReviewName(event.target.value)} required />
                </div>
                <div className="field">
                  <label>Your rating</label>
                  <button className="stars" type="button" onClick={() => setRating(5)} aria-label="Set five star rating">★★★★★</button>
                </div>
                <div className="field">
                  <label>Your review</label>
                  <textarea value={reviewText} onChange={(event: ChangeEvent<HTMLTextAreaElement>) => setReviewText(event.target.value)} required />
                </div>
                <button className="btn green" type="submit">Submit Review</button>
              </form>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

function RelatedProducts() {
  return (
    <section className="section">
      <div className="container">
        <div className="section-head">
          <h2>Related products</h2>
          <p>Future categories stay visible without being presented as currently available.</p>
        </div>
        <div className="grid2">
          <Link className="card" to="#">
            <div className="visual"><span className="badge">Coming Soon</span><div className="pack">CASSAVA<br/>FLOUR</div></div>
            <div className="body"><h3>Cassava Flour</h3><span className="status">Coming Soon</span></div>
          </Link>
          <Link className="card" to="#">
            <div className="visual"><span className="badge">Coming Soon</span><div className="pack">YAM<br/>FLOUR</div></div>
            <div className="body"><h3>Yam Flour</h3><span className="status">Coming Soon</span></div>
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function Product() {
  return (
    <StorefrontLayout>
      <ProductMain />
      <ProductInformation />
      <Reviews />
      <RelatedProducts />
    </StorefrontLayout>
  );
}
