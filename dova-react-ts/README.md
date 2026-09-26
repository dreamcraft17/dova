# DOVA Chain — Native React + TypeScript Conversion

This project is a native React + TypeScript conversion of the uploaded DOVA Chain frontend pages.

## What was converted

- Storefront: homepage, marketplace, Plantain Flour product page, bundles, contact and feedback.
- Admin portal: all 19 portal pages plus the supplied admin index page.
- Supplier portal: all supplied supplier pages.
- Logistics portal: dashboard, jobs, active delivery, history, earnings, notifications, profile, support, login and index.
- Shared navigation, sidebars, top bars, footer, toast UI and responsive behavior were componentized.
- Original inline JavaScript behaviors were converted to React state/events.
- Forms use a typed mock service layer in `src/services/mockApi.ts` until production API endpoints are connected.
- No old HTML page is imported, embedded, iframed, or rendered through `dangerouslySetInnerHTML`.

## Run in VS Code

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
npm run preview
```

## Main structure

```text
src/
  components/
    HomeHeader.tsx
    PortalUI.tsx
  layouts/
    AdminLayout.tsx
    LogisticsLayout.tsx
    StorefrontLayout.tsx
    SupplierLayout.tsx
  pages/
    storefront/
    admin/
    supplier/
    logistics/
    PlaceholderPage.tsx
  services/
    mockApi.ts
  styles/
    home.css
    storefront.css
    admin.css
    supplier.css
    logistics.css
    global.css
  types/
  App.tsx
  main.tsx
```

## Important source notes

The uploaded source referenced a few pages that were not included as files: `about.html`, `cart.html`, `login.html`, `register.html`, and a DOVA AI/chat page. Those routes are intentionally represented by typed React placeholder screens rather than invented copies of missing source pages.

The uploaded ZIPs did not contain local image/icon/font asset files. The homepage's original remote agricultural image URL was preserved rather than replaced with a placeholder.

The root `index.html` in this project is only the Vite application entry point. It is not one of the original standalone HTML pages.

## Route map

- `admin-analytics.tsx` → `/admin/analytics`
- `admin-audit.tsx` → `/admin/audit`
- `admin-bundle-detail.tsx` → `/admin/bundle-detail`
- `admin-bundles.tsx` → `/admin/bundles`
- `admin-contacts.tsx` → `/admin/contacts`
- `admin-dashboard.tsx` → `/admin`
- `admin-feedback.tsx` → `/admin/feedback`
- `admin-finance.tsx` → `/admin/finance`
- `admin-inventory.tsx` → `/admin/inventory`
- `admin-logistics.tsx` → `/admin/logistics`
- `admin-monitoring.tsx` → `/admin/monitoring`
- `admin-order-detail.tsx` → `/admin/order-detail`
- `admin-orders.tsx` → `/admin/orders`
- `admin-products.tsx` → `/admin/products`
- `admin-settings.tsx` → `/admin/settings`
- `admin-supplier-detail.tsx` → `/admin/supplier-detail`
- `admin-suppliers.tsx` → `/admin/suppliers`
- `admin-users.tsx` → `/admin/users`
- `index.tsx` → `/admin/index`
- `logistics-registration.tsx` → `/admin/logistics-registration`
- `add-product.tsx` → `/supplier/add-product`
- `dashboard.tsx` → `/supplier`
- `supplier-feedback.tsx` → `/supplier/feedback`
- `supplier-orders.tsx` → `/supplier/orders`
- `supplier-products.tsx` → `/supplier/products`
- `supplier-profile.tsx` → `/supplier/profile`
- `supplier-sales.tsx` → `/supplier/sales`
- `supplier-settings.tsx` → `/supplier/settings`
- `index.tsx` → `/logistics/index`
- `logistics-active.tsx` → `/logistics/active`
- `logistics-available.tsx` → `/logistics/available`
- `logistics-dashboard.tsx` → `/logistics`
- `logistics-earnings.tsx` → `/logistics/earnings`
- `logistics-history.tsx` → `/logistics/history`
- `logistics-login.tsx` → `/logistics/login`
- `logistics-notifications.tsx` → `/logistics/notifications`
- `logistics-profile.tsx` → `/logistics/profile`
- `logistics-support.tsx` → `/logistics/support`

## Designer/developer editing rule

Each page's actual UI is inside its `.tsx` component or a shared React component. For example, the admin dashboard content is in `src/pages/admin/admin-dashboard.tsx`, while its repeated sidebar/topbar shell is in `src/layouts/AdminLayout.tsx`.

This means a designer/developer can open the TSX file in VS Code and directly see and edit the React JSX structure.

## Validation

A TypeScript project check was run successfully against the generated source. A complete Vite production build could not be executed in the conversion environment because access to the npm registry timed out; the project includes the normal Vite/React dependencies in `package.json` so it can be installed and built in a normal connected development environment.
