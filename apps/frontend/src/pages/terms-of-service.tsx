import { LegalPage, LegalSection } from '../components/LegalPage';

const sections: LegalSection[] = [
  {
    id: 'introduction',
    title: 'Introduction and Acceptance of Terms',
    body: (
      <>
        <p>
          These Terms of Service (“Terms”) govern your access to and use of DOVA, an online agricultural
          marketplace connecting customers with verified suppliers in Nigeria. By creating an account,
          placing an order, listing products as a supplier, or otherwise using DOVA, you agree to these
          Terms.
        </p>
        <p>If you do not agree to these Terms, you should not use DOVA.</p>
      </>
    ),
  },
  {
    id: 'definitions',
    title: 'Definitions',
    body: (
      <ul>
        <li><strong>“DOVA”, “we”, “us”</strong> — the operator of the DOVA marketplace</li>
        <li><strong>“Customer”</strong> — a user who browses or purchases products or bundles on DOVA</li>
        <li><strong>“Supplier”</strong> — a verified business or individual who lists products for sale on DOVA</li>
        <li><strong>“Bundle”</strong> — a curated group of products sold together at a set price</li>
        <li><strong>“Order”</strong> — a confirmed purchase of one or more products or bundles</li>
        <li><strong>“Platform”</strong> — the DOVA website and associated services</li>
      </ul>
    ),
  },
  {
    id: 'eligibility',
    title: 'Eligibility and Account Registration',
    body: (
      <>
        <p>
          You must be able to lawfully enter into a contract under Nigerian law to use DOVA. When you
          register, you agree to provide accurate, current, and complete information, and to keep it
          up to date. DOVA may refuse or suspend registration where information provided is false,
          incomplete, or cannot be verified.
        </p>
      </>
    ),
  },
  {
    id: 'account-security',
    title: 'Account Security',
    body: (
      <p>
        You are responsible for maintaining the confidentiality of your account credentials and for all
        activity that occurs under your account. Notify us immediately at{' '}
        <a href="mailto:support@dova.com">support@dova.com</a> if you suspect unauthorized access to your
        account.
      </p>
    ),
  },
  {
    id: 'customer-responsibilities',
    title: 'Customer Responsibilities',
    body: (
      <ul>
        <li>Provide accurate delivery and contact information for each order</li>
        <li>Pay for orders using the payment methods offered on the platform</li>
        <li>Use the platform only for lawful purposes</li>
        <li>Not misuse the feedback board, chat assistant, or contact channels to submit abusive, false, or fraudulent content</li>
      </ul>
    ),
  },
  {
    id: 'supplier-verification',
    title: 'Supplier Eligibility and Verification',
    body: (
      <p>
        Suppliers must complete DOVA's verification process, which may include submitting business
        information and supporting documents, before listing products. DOVA may approve, reject, suspend,
        or revoke supplier status at its discretion, including where information provided is inaccurate,
        verification cannot be completed, or these Terms are breached.
      </p>
    ),
  },
  {
    id: 'supplier-responsibilities',
    title: 'Supplier Responsibilities',
    body: (
      <ul>
        <li>List products and bundles accurately, including price, description, quantity, and images</li>
        <li>Only list products the supplier is legally entitled to sell</li>
        <li>Comply with applicable Nigerian product, safety, and labelling laws</li>
        <li>Fulfil confirmed orders in the quantities and timeframes committed</li>
        <li>Respond to order and delivery issues raised by customers or DOVA in good faith</li>
        <li>Maintain accurate stock levels on the platform</li>
      </ul>
    ),
  },
  {
    id: 'product-listings',
    title: 'Product Listings and Information',
    body: (
      <p>
        Suppliers are solely responsible for the accuracy of the product information, pricing, and images
        they upload. DOVA reviews and may edit, deactivate, or remove listings that appear inaccurate,
        misleading, or non-compliant with applicable law, but DOVA does not guarantee that every listing has
        been independently verified for accuracy.
      </p>
    ),
  },
  {
    id: 'product-quality',
    title: 'Product Quality and Safety',
    body: (
      <p>
        Suppliers are responsible for the quality, safety, and condition of the products they list and
        deliver, consistent with the consumer-protection standards under the Federal Competition and
        Consumer Protection Act 2018 (“FCCPA”). Nothing in these Terms limits a customer's statutory rights
        regarding defective or misdescribed goods.
      </p>
    ),
  },
  {
    id: 'pricing-taxes',
    title: 'Pricing, Taxes and Charges',
    body: (
      <p>
        Product and bundle prices are set by suppliers (or by DOVA for curated bundles) and displayed on
        the platform at checkout. Unless stated otherwise, displayed prices are in Nigerian Naira (₦) and
        do not automatically include separately itemized delivery charges, which are shown before you
        confirm your order. Applicable taxes, where required by law, will be disclosed before payment.
      </p>
    ),
  },
  {
    id: 'orders',
    title: 'Orders and Order Confirmation',
    body: (
      <p>
        An order is placed once you complete checkout and payment is confirmed. DOVA will provide an order
        confirmation with the order details, chosen delivery slot, and payment status. DOVA or the relevant
        supplier may cancel an order before fulfilment where a product is unexpectedly unavailable, in
        which case you will be notified and refunded in accordance with the Cancellation and Refunds
        section below.
      </p>
    ),
  },
  {
    id: 'payment',
    title: 'Payment and Payment Provider',
    body: (
      <p>
        Payments are processed through Paystack, an independent, regulated payment service provider.
        DOVA is not a bank or licensed payment service provider and does not directly hold or process your
        card or bank details. Your use of Paystack's payment services is also subject to Paystack's own
        terms. DOVA is responsible for the marketplace transaction; Paystack is responsible for the payment
        processing infrastructure.
      </p>
    ),
  },
  {
    id: 'delivery',
    title: 'Delivery',
    body: (
      <p>
        Customers may select a preferred delivery slot (morning or evening) at checkout. Delivery is
        performed by the supplier or an appointed logistics partner. While DOVA and suppliers take
        reasonable steps to meet the selected delivery window, delivery times are estimates and may be
        affected by factors outside DOVA's control, such as weather, traffic, or product availability.
      </p>
    ),
  },
  {
    id: 'cancellation-refunds-returns',
    title: 'Cancellation, Refunds and Returns',
    body: (
      <>
        <p>
          You may cancel an order before it is dispatched by contacting{' '}
          <a href="mailto:support@dova.com">support@dova.com</a>. Once dispatched, cancellation may no
          longer be possible.
        </p>
        <p>
          If an item arrives damaged, incorrect, or materially not as described, you may request a refund
          or replacement within a reasonable time after delivery, consistent with your rights under the
          FCCPA. Refunds are processed back to your original payment method via Paystack and may take a
          few business days to reflect, depending on your bank.
        </p>
        <p>Nothing in this section limits any statutory consumer right that cannot lawfully be excluded.</p>
      </>
    ),
  },
  {
    id: 'complaints',
    title: 'Complaints',
    body: (
      <p>
        If you have a complaint about an order, a supplier, or the platform, contact{' '}
        <a href="mailto:support@dova.com">support@dova.com</a> with your order details. We aim to
        acknowledge complaints promptly and work with the relevant supplier to resolve them. Unresolved
        consumer complaints may also be escalated to the Federal Competition and Consumer Protection
        Commission (FCCPC).
      </p>
    ),
  },
  {
    id: 'prohibited',
    title: 'Prohibited Products and Activities',
    body: (
      <>
        <p>Suppliers may not list, and customers may not attempt to purchase:</p>
        <ul>
          <li>Illegal, counterfeit, or stolen goods</li>
          <li>Products prohibited under Nigerian law or unsafe for consumption or use</li>
          <li>Misrepresented agricultural products (e.g. false origin, grade, or condition)</li>
        </ul>
        <p>In addition, all users must not:</p>
        <ul>
          <li>Attempt unauthorized access to DOVA's systems or another user's account</li>
          <li>Circumvent platform security or interfere with platform operations</li>
          <li>Use the platform for fraud, money laundering, or other illegal activity</li>
          <li>Upload malicious code or engage in any activity prohibited under the Cybercrimes Act</li>
        </ul>
      </>
    ),
  },
  {
    id: 'fraud-abuse',
    title: 'Fraud and Abuse',
    body: (
      <p>
        DOVA may investigate suspected fraudulent orders, listings, payments, or account activity, and may
        suspend affected accounts, cancel affected orders, or withhold payouts pending investigation.
        Confirmed fraud may be reported to the relevant Nigerian authorities.
      </p>
    ),
  },
  {
    id: 'intellectual-property',
    title: 'Intellectual Property and User Content',
    body: (
      <p>
        The DOVA name, logo, website design, and software are owned by DOVA or its licensors and may not be
        copied or used without permission. Suppliers retain ownership of the product descriptions, images,
        and other content they upload, but grant DOVA a non-exclusive licence to display that content on
        the platform for the purpose of operating the marketplace. Suppliers are responsible for ensuring
        they hold the necessary rights to any content or brand names they upload.
      </p>
    ),
  },
  {
    id: 'platform-availability',
    title: 'Platform Availability and Third-Party Services',
    body: (
      <p>
        DOVA aims to keep the platform available and reliable but does not guarantee uninterrupted access,
        and may suspend the platform for maintenance, updates, or reasons beyond our control. DOVA relies on
        third-party services (including Paystack for payments and cloud hosting providers) and is not
        responsible for outages or failures caused solely by those third parties, though we will work to
        minimize disruption.
      </p>
    ),
  },
  {
    id: 'liability',
    title: 'Limitation of Liability and Indemnification',
    body: (
      <>
        <p>
          To the fullest extent permitted by Nigerian law, DOVA is not liable for indirect, incidental, or
          consequential losses arising from your use of the platform. Nothing in these Terms excludes or
          limits liability that cannot lawfully be excluded under the FCCPA or other applicable Nigerian
          law, including liability for defective products where DOVA is legally responsible.
        </p>
        <p>
          You agree to indemnify DOVA against claims arising from your breach of these Terms, misuse of the
          platform, or — for suppliers — inaccurate listings or defective products, to the extent permitted
          by law.
        </p>
      </>
    ),
  },
  {
    id: 'suspension-termination',
    title: 'Suspension and Termination',
    body: (
      <p>
        DOVA may suspend or terminate an account that breaches these Terms, engages in fraudulent or
        unlawful activity, or poses a risk to other users or the platform. You may close your account at
        any time by contacting <a href="mailto:support@dova.com">support@dova.com</a>. Sections of these
        Terms that by their nature should survive termination (such as liability and dispute resolution)
        will continue to apply.
      </p>
    ),
  },
  {
    id: 'dispute-resolution',
    title: 'Dispute Resolution and Governing Law',
    body: (
      <p>
        These Terms are governed by the laws of the Federal Republic of Nigeria. Before pursuing formal
        proceedings, we encourage you to first raise any dispute with{' '}
        <a href="mailto:support@dova.com">support@dova.com</a> so we can attempt to resolve it directly.
        Nothing in this section removes your statutory right to escalate an unresolved consumer complaint
        to the FCCPC or to pursue a claim before a competent Nigerian court.
      </p>
    ),
  },
  {
    id: 'changes',
    title: 'Changes to These Terms',
    body: (
      <p>
        We may update these Terms from time to time as DOVA's services or applicable law evolve. Material
        changes will be reflected by updating the “Last updated” date above. Continued use of DOVA after
        changes take effect means you accept the updated Terms.
      </p>
    ),
  },
  {
    id: 'contact',
    title: 'Contact Information',
    body: (
      <p>
        For questions about these Terms, email <a href="mailto:support@dova.com">support@dova.com</a> or
        call <a href="tel:+2349032696825">+234 903 269 6825</a>.
      </p>
    ),
  },
];

export default function TermsOfService() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Terms of Service"
      effectiveDate="19 September 2026"
      lastUpdated="19 September 2026"
      summary={
        <p>
          <strong>In short:</strong> DOVA is a marketplace connecting you with independent, verified
          suppliers — not the seller of record for most products. Suppliers are responsible for their
          listings and product quality; DOVA is responsible for running the platform and payments (via
          Paystack) fairly. Your statutory consumer rights under Nigerian law always apply, regardless of
          anything else in these Terms. The full details are below.
        </p>
      }
      sections={sections}
    />
  );
}
