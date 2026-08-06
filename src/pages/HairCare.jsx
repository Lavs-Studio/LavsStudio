import Layout from '../components/Layout';
import SectionTitle from '../components/SectionTitle';
import ProductCard from '../components/ProductCard';
import Seo from '../components/Seo';
import { products } from '../data/products';

export default function HairCare() {
  const hairItems = products.filter((item) => item.category === 'Hair Care');

  return (
    <Layout>
      <Seo
        title="Hair Care"
        description="Explore hair care essentials and styling tools to keep your routine polished, healthy, and Pinterest-ready."
      />
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionTitle eyebrow="Hair Care" title="Tools and rituals for healthy shine" description="Elevated essentials for styling with ease and comfort." />
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {hairItems.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </Layout>
  );
}
