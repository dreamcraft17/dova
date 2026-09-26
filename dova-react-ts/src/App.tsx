import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import './styles/global.css';
import './styles/home.css';
import './styles/storefront.css';
import './styles/admin.css';
import './styles/supplier.css';
import './styles/logistics.css';
import HomePage from './pages/storefront/HomePage';
import Marketplace from './pages/storefront/marketplace';
import Product from './pages/storefront/product';
import Bundles from './pages/storefront/bundles';
import Contact from './pages/storefront/contact';
import Feedback from './pages/storefront/feedback';
import AdminAnalytics from './pages/admin/admin-analytics';
import AdminAudit from './pages/admin/admin-audit';
import AdminBundleDetail from './pages/admin/admin-bundle-detail';
import AdminBundles from './pages/admin/admin-bundles';
import AdminContacts from './pages/admin/admin-contacts';
import AdminDashboard from './pages/admin/admin-dashboard';
import AdminFeedback from './pages/admin/admin-feedback';
import AdminFinance from './pages/admin/admin-finance';
import AdminInventory from './pages/admin/admin-inventory';
import AdminLogistics from './pages/admin/admin-logistics';
import AdminMonitoring from './pages/admin/admin-monitoring';
import AdminOrderDetail from './pages/admin/admin-order-detail';
import AdminOrders from './pages/admin/admin-orders';
import AdminProducts from './pages/admin/admin-products';
import AdminSettings from './pages/admin/admin-settings';
import AdminSupplierDetail from './pages/admin/admin-supplier-detail';
import AdminSuppliers from './pages/admin/admin-suppliers';
import AdminUsers from './pages/admin/admin-users';
import AdminIndex from './pages/admin/index';
import LogisticsRegistration from './pages/admin/logistics-registration';
import AddProduct from './pages/supplier/add-product';
import Dashboard from './pages/supplier/dashboard';
import SupplierFeedback from './pages/supplier/supplier-feedback';
import SupplierOrders from './pages/supplier/supplier-orders';
import SupplierProducts from './pages/supplier/supplier-products';
import SupplierProfile from './pages/supplier/supplier-profile';
import SupplierSales from './pages/supplier/supplier-sales';
import SupplierSettings from './pages/supplier/supplier-settings';
import LogisticsIndex from './pages/logistics/index';
import LogisticsActive from './pages/logistics/logistics-active';
import LogisticsAvailable from './pages/logistics/logistics-available';
import LogisticsDashboard from './pages/logistics/logistics-dashboard';
import LogisticsEarnings from './pages/logistics/logistics-earnings';
import LogisticsHistory from './pages/logistics/logistics-history';
import LogisticsLogin from './pages/logistics/logistics-login';
import LogisticsNotifications from './pages/logistics/logistics-notifications';
import LogisticsProfile from './pages/logistics/logistics-profile';
import LogisticsSupport from './pages/logistics/logistics-support';
import PlaceholderPage from './pages/PlaceholderPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/marketplace" element={<Marketplace />} />
        <Route path="/product" element={<Product />} />
        <Route path="/bundles" element={<Bundles />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/feedback" element={<Feedback />} />
        <Route path="/admin/analytics" element={<AdminAnalytics />} />
        <Route path="/admin/audit" element={<AdminAudit />} />
        <Route path="/admin/bundle-detail" element={<AdminBundleDetail />} />
        <Route path="/admin/bundles" element={<AdminBundles />} />
        <Route path="/admin/contacts" element={<AdminContacts />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/feedback" element={<AdminFeedback />} />
        <Route path="/admin/finance" element={<AdminFinance />} />
        <Route path="/admin/inventory" element={<AdminInventory />} />
        <Route path="/admin/logistics" element={<AdminLogistics />} />
        <Route path="/admin/monitoring" element={<AdminMonitoring />} />
        <Route path="/admin/order-detail" element={<AdminOrderDetail />} />
        <Route path="/admin/orders" element={<AdminOrders />} />
        <Route path="/admin/products" element={<AdminProducts />} />
        <Route path="/admin/settings" element={<AdminSettings />} />
        <Route path="/admin/supplier-detail" element={<AdminSupplierDetail />} />
        <Route path="/admin/suppliers" element={<AdminSuppliers />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/index" element={<AdminIndex />} />
        <Route path="/admin/logistics-registration" element={<LogisticsRegistration />} />
        <Route path="/supplier/add-product" element={<AddProduct />} />
        <Route path="/supplier" element={<Dashboard />} />
        <Route path="/supplier/feedback" element={<SupplierFeedback />} />
        <Route path="/supplier/orders" element={<SupplierOrders />} />
        <Route path="/supplier/products" element={<SupplierProducts />} />
        <Route path="/supplier/profile" element={<SupplierProfile />} />
        <Route path="/supplier/sales" element={<SupplierSales />} />
        <Route path="/supplier/settings" element={<SupplierSettings />} />
        <Route path="/logistics/index" element={<LogisticsIndex />} />
        <Route path="/logistics/active" element={<LogisticsActive />} />
        <Route path="/logistics/available" element={<LogisticsAvailable />} />
        <Route path="/logistics" element={<LogisticsDashboard />} />
        <Route path="/logistics/earnings" element={<LogisticsEarnings />} />
        <Route path="/logistics/history" element={<LogisticsHistory />} />
        <Route path="/logistics/login" element={<LogisticsLogin />} />
        <Route path="/logistics/notifications" element={<LogisticsNotifications />} />
        <Route path="/logistics/profile" element={<LogisticsProfile />} />
        <Route path="/logistics/support" element={<LogisticsSupport />} />
        <Route path="/about" element={<PlaceholderPage title="About" message="The original project links to an About page, but no about.html file was included in the uploaded source." />} />
        <Route path="/cart" element={<PlaceholderPage title="Cart" message="The original project links to a Cart page, but no cart.html file was included in the uploaded source." />} />
        <Route path="/login" element={<PlaceholderPage title="Login" message="The original project links to a Login page, but no login.html file was included in the uploaded source." />} />
        <Route path="/register" element={<PlaceholderPage title="Register" message="The original project links to a Register page, but no register.html file was included in the uploaded source." />} />
        <Route path="/chat" element={<PlaceholderPage title="DOVA AI" message="The original project links to DOVA AI, but no chat page was included in the uploaded source." />} />
        <Route path="/auth/supplier-register" element={<PlaceholderPage title="Supplier Registration" message="The source links to supplier registration, but no supplier registration page was included in the uploaded source." />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}