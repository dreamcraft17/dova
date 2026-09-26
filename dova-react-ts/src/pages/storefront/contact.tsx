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
        Contact DOVA Chain
      </div>
      <h1>
        Let's connect around food, technology and supply.
      </h1>
      <p>
        For customer support, farmer/supplier inquiries, business supply or partnership conversations, use the appropriate route below.
      </p>
    </div>
    <div className="hero-art">
      <div className="flow">
        <b>
          CUSTOMERS
        </b>
        <b>
          FARMERS
        </b>
        <b>
          BUSINESSES
        </b>
        <b>
          PARTNERS
        </b>
      </div>
    </div>
  </div>
</section>
<section className="section">
  <div className="container">
    <div className="contact-grid">
      <div>
        <div className="contact-card">
          <strong>
            Customer support
          </strong>
          <span>
            Questions about products, orders, delivery or feedback.
          </span>
          <a className="btn outline" href="mailto:officialdovachain@gmail.com" style={{"marginTop": "12px"}}>
            Email Support
          </a>
        </div>
        <div className="contact-card" style={{"marginTop": "10px"}}>
          <strong>
            Business & partnerships
          </strong>
          <span>
            Restaurants, retailers, commercial buyers, technology partners and ecosystem conversations.
          </span>
          <a className="btn outline" href="mailto:officialdovachain@gmail.com" style={{"marginTop": "12px"}}>
            Start a Conversation
          </a>
        </div>
        <div className="contact-card" style={{"marginTop": "10px"}}>
          <strong>
            Farmers & suppliers
          </strong>
          <span>
            Join the DOVA network and share your supply information through the farmer onboarding flow.
          </span>
          <Link className="btn outline" to="/" style={{"marginTop": "12px"}}>
            Explore DOVA
          </Link>
        </div>
      </div>
      <div className="panel">
        <div className="eyebrow">
          Send a message
        </div>
        <h2>
          Contact form
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>
              Name
            </label>
            <input required placeholder="Full name" />
          </div>
          <div className="field">
            <label>
              Email
            </label>
            <input type="email" required placeholder="Email address" />
          </div>
          <div className="field">
            <label>
              Topic
            </label>
            <select>
              <option>
                Customer Support
              </option>
              <option>
                Business Supply
              </option>
              <option>
                Farmer / Supplier
              </option>
              <option>
                Partnership
              </option>
              <option>
                Technology
              </option>
              <option>
                Other
              </option>
            </select>
          </div>
          <div className="field">
            <label>
              Message
            </label>
            <textarea required placeholder="How can DOVA help?"></textarea>
          </div>
          <button className="btn green">
            Send Message
          </button>
          <p id="sent" style={{"fontSize": ".62rem", "color": "var(--emerald)"}}></p>
        </form>
      </div>
    </div>
  </div>
</section>
    </>
  );
}

export default function Contact() { return <StorefrontLayout><PageContent /></StorefrontLayout>; }