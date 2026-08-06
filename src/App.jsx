import { Routes, Route } from 'react-router-dom';
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
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
