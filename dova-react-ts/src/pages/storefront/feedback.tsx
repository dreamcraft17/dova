import { Link } from 'react-router-dom';
import { usePortalUI } from '../../components/PortalUI';
import { submitPrototypeForm } from '../../services/mockApi';
import type { FormEvent } from 'react';
import StorefrontLayout from '../../layouts/StorefrontLayout';

function PageContent() {
  const { showToast } = usePortalUI();
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await submitPrototypeForm(Object.fromEntries(new FormData(event.currentTarget).entries()));
    showToast('Form captured in this prototype. Connect it to the production API/email endpoint.');
  };
  return (
    <>
<section className="hero">
  <div className="container hero-grid">
    <div>
      <div className="eyebrow">
        DOVA Feedback
      </div>
      <h1>
        Help us build a better food experience.
      </h1>
      <p>
        Customers, farmers, businesses and partners can share what works, what does not, and what DOVA should improve.
      </p>
    </div>
    <div className="hero-art">
      <div className="flow">
        <b>
          LISTEN
        </b>
        <span>
          →
        </span>
        <b>
          LEARN
        </b>
        <span>
          →
        </span>
        <b>
          IMPROVE
        </b>
      </div>
    </div>
  </div>
</section>
<section className="section">
  <div className="container">
    <div className="contact-grid">
      <div className="panel">
        <div className="eyebrow">
          Feedback form
        </div>
        <h2>
          Tell DOVA what you think
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>
              Name
            </label>
            <input required placeholder="Your name" />
          </div>
          <div className="field">
            <label>
              Email
            </label>
            <input type="email" required placeholder="you@example.com" />
          </div>
          <div className="field">
            <label>
              Feedback type
            </label>
            <select>
              <option>
                Product
              </option>
              <option>
                Website
              </option>
              <option>
                Ordering
              </option>
              <option>
                Delivery
              </option>
              <option>
                Support
              </option>
              <option>
                Farmer experience
              </option>
              <option>
                Business supply
              </option>
              <option>
                Other
              </option>
            </select>
          </div>
          <div className="field">
            <label>
              Feedback
            </label>
            <textarea required placeholder="Share your experience or suggestion\u2026"></textarea>
          </div>
          <button className="btn green">
            Send Feedback
          </button>
          <p id="done" style={{"fontSize": ".62rem", "color": "var(--emerald)"}}></p>
        </form>
      </div>
      <div>
        <div className="contact-card">
          <strong>
            What can you tell us?
          </strong>
          <span>
            Product quality, website experience, ordering, delivery, customer support, farmer onboarding or business supply.
          </span>
        </div>
        <div className="contact-card" style={{"marginTop": "10px"}}>
          <strong>
            Need direct support?
          </strong>
          <span>
            For an account or order issue, use the Contact Us page so the support request can be routed appropriately.
          </span>
          <Link className="btn outline" to="/contact" style={{"marginTop": "12px"}}>
            Contact DOVA
          </Link>
        </div>
      </div>
    </div>
  </div>
</section>
    </>
  );
}

export default function Feedback() { return <StorefrontLayout><PageContent /></StorefrontLayout>; }