import { LegalPage, LegalSection } from '../components/LegalPage';

const sections: LegalSection[] = [
  {
    id: 'introduction',
    title: 'Introduction',
    body: (
      <>
        <p>
          DOVA (“DOVA”, “we”, “us”, or “our”) operates an online agricultural marketplace that connects
          customers with verified suppliers of fresh produce and agricultural products in Nigeria. This
          Privacy Policy explains what personal data we collect, why we collect it, how we use and share
          it, and the rights you have over it.
        </p>
        <p>
          This Policy is written to comply with the Nigeria Data Protection Act 2023 (“NDP Act”) and its
          2025 General Application and Implementation Directive (“GAID”), issued by the Nigeria Data
          Protection Commission (“NDPC”).
        </p>
      </>
    ),
  },
  {
    id: 'who-we-are',
    title: 'Who We Are',
    body: (
      <p>
        DOVA is the trading name of the entity operating the DOVA website and mobile experience
        (dova.dntech.id and related domains). For the purposes of the NDP Act, DOVA acts as the{' '}
        <strong>data controller</strong> for personal data collected through the platform, and as a{' '}
        <strong>data processor</strong> in limited cases where we process data on a supplier's behalf (for
        example, sharing a customer's delivery details with the supplier fulfilling that order).
      </p>
    ),
  },
  {
    id: 'scope',
    title: 'Scope of This Privacy Policy',
    body: (
      <p>
        This Policy applies to customers, suppliers, and visitors who use the DOVA website, create an
        account, browse products or bundles, place orders, contact support, use the DOVA AI assistant, or
        otherwise interact with the platform. It does not apply to third-party sites we link to, or to the
        independent privacy practices of payment, delivery, or other service providers, which are governed
        by their own privacy policies.
      </p>
    ),
  },
  {
    id: 'data-we-collect',
    title: 'Personal Data We Collect',
    body: (
      <>
        <h3>Customer data</h3>
        <ul>
          <li>Full name, email address, and phone number</li>
          <li>Delivery address(es) and preferred delivery time slot (morning/evening)</li>
          <li>Account credentials and account activity</li>
          <li>Order history, cart contents, and saved preferences</li>
          <li>Customer support and contact-form messages, and messages sent to the DOVA AI assistant</li>
        </ul>
        <h3>Supplier data</h3>
        <ul>
          <li>Business name, contact person, and contact details</li>
          <li>Verification information and documents submitted during supplier registration</li>
          <li>Bank or payment details required for payouts, where applicable</li>
          <li>Product and bundle listings, pricing, and stock information</li>
        </ul>
        <h3>Transaction data</h3>
        <ul>
          <li>Order details, quantities, and pricing</li>
          <li>Payment status and transaction references (see “Payment Service Providers” below)</li>
          <li>Refund and dispute records</li>
        </ul>
        <h3>Technical data</h3>
        <ul>
          <li>Log data such as IP address, device/browser type, and access timestamps</li>
          <li>Cookies and similar identifiers used to keep you signed in and remember cart contents</li>
        </ul>
        <p>We only collect the categories of data above that are relevant to the account type and features you actually use.</p>
      </>
    ),
  },
  {
    id: 'how-we-collect',
    title: 'How We Collect Personal Data',
    body: (
      <ul>
        <li>Directly from you — when you register, place an order, list a product, or contact us</li>
        <li>Automatically — through cookies and server logs as you use the platform</li>
        <li>From payment and verification providers — such as payment confirmations from our payment partner</li>
      </ul>
    ),
  },
  {
    id: 'why-we-use-data',
    title: 'Why We Collect and Use Personal Data',
    body: (
      <ul>
        <li>Creating and managing customer and supplier accounts</li>
        <li>Processing orders, payments, and deliveries</li>
        <li>Verifying supplier eligibility and business information</li>
        <li>Providing customer support and responding to enquiries</li>
        <li>Operating the DOVA AI assistant and the feedback/roadmap board, where you choose to use them</li>
        <li>Detecting and preventing fraud, abuse, and unauthorized access</li>
        <li>Complying with Nigerian legal and regulatory obligations</li>
        <li>Improving the marketplace, and — where legally permitted — sending you service or promotional communications</li>
      </ul>
    ),
  },
  {
    id: 'lawful-bases',
    title: 'Lawful Bases for Processing',
    body: (
      <>
        <p>We rely on the following lawful bases, depending on the activity:</p>
        <ul>
          <li><strong>Performance of a contract</strong> — creating your account, processing orders, and delivering products</li>
          <li><strong>Consent</strong> — optional marketing communications and non-essential cookies, which you can withdraw at any time</li>
          <li><strong>Legal obligation</strong> — record-keeping, tax, and responding to lawful requests from regulators or law enforcement</li>
          <li><strong>Legitimate interests</strong> — fraud prevention, platform security, and service improvement, balanced against your rights</li>
        </ul>
      </>
    ),
  },
  {
    id: 'cookies',
    title: 'Cookies and Similar Technologies',
    body: (
      <p>
        DOVA uses essential cookies and local storage to keep you signed in, remember your cart, and keep
        the platform secure — these are necessary for the service to function and cannot be switched off.
        If DOVA introduces optional analytics or advertising cookies in the future, this section will be
        updated to explain what they do and how you can opt out.
      </p>
    ),
  },
  {
    id: 'how-we-share',
    title: 'How We Share Personal Data',
    body: (
      <p>
        We only disclose personal data where necessary for the marketplace to function, and never sell
        personal data to third parties. Depending on the activity, recipients may include suppliers
        fulfilling your order, our payment provider, hosting and infrastructure providers, and — where
        legally required — regulators or law-enforcement authorities. Each category is explained below.
      </p>
    ),
  },
  {
    id: 'suppliers-marketplace',
    title: 'Suppliers and Marketplace Participants',
    body: (
      <p>
        When you place an order, we share the information the supplier needs to fulfil it — such as your
        name, delivery address, phone number, and order contents. We do not share your email address,
        account credentials, or full order history with suppliers. Suppliers may only use this information
        to fulfil the relevant order and must not use it for unrelated marketing.
      </p>
    ),
  },
  {
    id: 'payment-providers',
    title: 'Payment Service Providers',
    body: (
      <p>
        Payments on DOVA are processed by Paystack, a regulated Nigerian payment service provider. DOVA
        does not store your full card or bank account details — these are handled directly by Paystack in
        accordance with its own security standards and privacy policy. DOVA receives and retains only the
        payment status and transaction reference needed to confirm your order and maintain accurate
        financial and legal records.
      </p>
    ),
  },
  {
    id: 'delivery-providers',
    title: 'Delivery and Logistics Providers',
    body: (
      <p>
        Where delivery is fulfilled by a third-party logistics partner rather than the supplier directly,
        we share the minimum delivery information necessary — recipient name, delivery address, phone
        number, and delivery slot — solely to complete that delivery.
      </p>
    ),
  },
  {
    id: 'international-transfers',
    title: 'International Data Transfers',
    body: (
      <p>
        Some of our service providers, such as cloud hosting or email delivery services, may process data
        outside Nigeria. Where this occurs, we take reasonable steps to ensure the provider offers an
        appropriate level of protection consistent with the NDP Act's requirements for cross-border data
        transfers.
      </p>
    ),
  },
  {
    id: 'data-security',
    title: 'Data Security',
    body: (
      <p>
        We apply reasonable technical and organizational measures to protect personal data, including
        access controls, authentication, encrypted transmission, and restricted internal access on a
        need-to-know basis. No system is completely secure, and we continually review our safeguards as
        the platform grows.
      </p>
    ),
  },
  {
    id: 'data-retention',
    title: 'Data Retention',
    body: (
      <p>
        We keep personal data only for as long as necessary for the purpose it was collected — typically
        for the life of your account plus a period required for accounting, tax, dispute-resolution, and
        legal-compliance purposes. When data is no longer needed, we delete or anonymize it, except where
        we are legally required to retain it for longer.
      </p>
    ),
  },
  {
    id: 'your-rights',
    title: 'Your Data Subject Rights',
    body: (
      <>
        <p>Under the NDP Act, you have the right to:</p>
        <ul>
          <li>Be informed about how your personal data is processed</li>
          <li>Access the personal data we hold about you</li>
          <li>Request correction of inaccurate or incomplete data</li>
          <li>Object to certain processing activities</li>
          <li>Request restriction of processing in applicable circumstances</li>
          <li>Receive certain data in a portable format</li>
          <li>Request erasure of your data where applicable</li>
          <li>Be protected against decisions based solely on automated processing</li>
          <li>Lodge a complaint with the Nigeria Data Protection Commission</li>
        </ul>
      </>
    ),
  },
  {
    id: 'exercise-rights',
    title: 'How to Exercise Your Rights',
    body: (
      <p>
        To exercise any of the rights above, email{' '}
        <a href="mailto:privacy@dova.com">privacy@dova.com</a> with your request and enough detail to
        verify your identity. We will respond within the timeframe required by applicable Nigerian law.
        You can also update your profile details directly from your account settings at any time.
      </p>
    ),
  },
  {
    id: 'children',
    title: "Children's Privacy",
    body: (
      <p>
        DOVA is intended for use by adults who can lawfully enter into a contract in Nigeria. We do not
        knowingly collect personal data from children. If we become aware that a child's data has been
        collected without appropriate consent, we will take steps to delete it.
      </p>
    ),
  },
  {
    id: 'breaches',
    title: 'Personal Data Breaches',
    body: (
      <p>
        We maintain internal procedures to detect, contain, investigate, and remediate suspected personal
        data breaches. Where a breach poses a risk to your rights and freedoms, we will notify the Nigeria
        Data Protection Commission and affected users as required under applicable Nigerian law.
      </p>
    ),
  },
  {
    id: 'dpo-contact',
    title: 'Data Protection Officer / Privacy Contact',
    body: (
      <p>
        Depending on DOVA's classification under the NDP Act and NDPC rules, a Data Protection Officer may
        be appointed to oversee compliance and act as a contact point with the Commission. In the meantime,
        all privacy queries can be directed to <a href="mailto:privacy@dova.com">privacy@dova.com</a>.
      </p>
    ),
  },
  {
    id: 'ndpc-complaints',
    title: 'Complaints to the NDPC',
    body: (
      <p>
        If you are not satisfied with how we have handled your personal data or a privacy request, you have
        the right to lodge a complaint directly with the Nigeria Data Protection Commission (NDPC), in
        addition to contacting us.
      </p>
    ),
  },
  {
    id: 'changes',
    title: 'Changes to This Privacy Policy',
    body: (
      <p>
        We may update this Privacy Policy from time to time as DOVA's services or applicable law evolve.
        Material changes will be reflected by updating the “Last updated” date above, and where the change
        significantly affects how your personal data is processed, we will take reasonable steps to notify
        you.
      </p>
    ),
  },
  {
    id: 'contact',
    title: 'Contact Information',
    body: (
      <p>
        For privacy questions, requests, or complaints, email{' '}
        <a href="mailto:privacy@dova.com">privacy@dova.com</a>. For general support, email{' '}
        <a href="mailto:support@dova.com">support@dova.com</a> or call{' '}
        <a href="tel:+2349032696825">+234 903 269 6825</a>.
      </p>
    ),
  },
];

export default function PrivacyPolicy() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Privacy Policy"
      effectiveDate="19 September 2026"
      lastUpdated="19 September 2026"
      summary={
        <p>
          <strong>In short:</strong> we collect the data needed to run your account, process orders, and
          get deliveries to you — name, contact details, delivery address, and order history. Payments are
          handled by Paystack, not stored by DOVA. We never sell your data, and you can request access,
          correction, or deletion at any time. The full details are below.
        </p>
      }
      sections={sections}
    />
  );
}
