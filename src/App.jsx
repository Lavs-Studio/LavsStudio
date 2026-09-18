import { Routes, Route } from 'react-router-dom';
import { Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Categories from './pages/Categories';
import Fashion from './pages/Fashion';
import Jewellery from './pages/Jewellery';
import HairCare from './pages/HairCare';
import SkinCare from './pages/SkinCare';
import AmazonFinds from './pages/AmazonFinds';
import BlogListing from './pages/BlogListing';
import BlogPost from './pages/BlogPost';
import About from './pages/About';
import Contact from './pages/Contact';
import PrivacyPolicy from './pages/PrivacyPolicy';
import AffiliateDisclosure from './pages/AffiliateDisclosure';
import NotFound from './pages/NotFound';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import ProtectedAdminRoute from './admin/ProtectedAdminRoute';
import AdminLayout from './admin/AdminLayout';

import AdminProducts from './pages/AdminProducts';
import AdminProductForm from './pages/AdminProductForm';
import AdminBlog from './pages/AdminBlog';
import AdminBlogForm from './pages/AdminBlogForm';
import AdminHomepage from './pages/AdminHomepage';
import AdminCategories from './pages/AdminCategories';
import AdminMedia from './pages/AdminMedia';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/categories" element={<Categories />} />
      <Route path="/fashion" element={<Fashion />} />
      <Route path="/jewellery" element={<Jewellery />} />
      <Route path="/hair-care" element={<HairCare />} />
      <Route path="/skin-care" element={<SkinCare />} />
      <Route path="/amazon-finds" element={<AmazonFinds />} />
      <Route path="/blog" element={<BlogListing />} />
      <Route path="/blog/:slug" element={<BlogPost />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/affiliate-disclosure" element={<AffiliateDisclosure />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/*" element={<ProtectedAdminRoute />}>
        <Route path="" element={<AdminLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="products/new" element={<AdminProductForm />} />
          <Route path="products/:id/edit" element={<AdminProductForm />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="blog" element={<AdminBlog />} />
          <Route path="blog/new" element={<AdminBlogForm />} />
          <Route path="blog/:id/edit" element={<AdminBlogForm />} />
          <Route path="homepage" element={<AdminHomepage />} />
          <Route path="media" element={<AdminMedia />} />
          <Route path="*" element={<Navigate to="dashboard" replace />} />
        </Route>
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
