import Layout from '../components/Layout';
import SectionTitle from '../components/SectionTitle';
import ProductCard from '../components/ProductCard';
import Seo from '../components/Seo';
import { products } from '../data/products';

export default function Jewellery() {
  const jewelleryItems = products.filter((item) => item.category === 'Jewellery');

  return (
    <Layout>
      <Seo
        title="Jewellery"
        description="Browse elevated jewellery picks for everyday sparkle, soft glam, and Pinterest-inspired styling."
      />
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionTitle eyebrow="Jewellery" title="Polished pieces for everyday glow" description="Delicate accents that bring softness to every look." />
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {jewelleryItems.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </Layout>
  );
}
