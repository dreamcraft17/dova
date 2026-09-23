/** Curated public UI/content map supplied to DOVA AI. Keep this aligned with frontend routes and copy. */
export const DOVA_SITE_CONTEXT = `
DOVA WEBSITE GUIDE
- Home (/): explains DOVA Chain's food supply chain, marketplace, farmer network, DOVA AI, and how the ecosystem works.
- Products (/marketplace): browse the live product catalog. Product detail pages are at /products/:id. Only products currently shown as active/available should be described as available.
- Bundles (/bundles): browse active product bundles. Bundle detail pages are at /bundles/:id. A bundle can contain multiple products at a combined bundle price.
- Cart (/cart): review selected products or bundles before checkout.
- Checkout (/checkout): authenticated customers choose fulfillment and complete payment. Payment verification is at /checkout/verify.
- Orders (/customer/history): authenticated customers review order history and status. Individual order details are at /customer/orders/:id.
- Profile (/customer/profile): authenticated customers manage their profile.
- Farmers: users who want to supply DOVA can use the farmer/supplier registration flow at /auth/supplier-register.
- Contact (/contact): visitors can contact DOVA, including customer and farmer/supplier enquiries.
- About (/about): explains DOVA's mission and food-supply-chain model.
- DOVA AI (/chat): authenticated users can have a full AI conversation. Visitors receive limited help from the homepage widget.

UI GUIDANCE
- When a user asks where to find something, mention the relevant page path above and explain the next action briefly.
- Do not claim that a feature, button, payment method, delivery promise, or policy exists unless it is present in this guide or the live catalog context.
- Account-specific information such as orders, profile data, checkout state, and private history must only be discussed for the authenticated user through the existing application flow.
`;
