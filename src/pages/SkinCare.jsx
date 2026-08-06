import Layout from '../components/Layout';
import SectionTitle from '../components/SectionTitle';
import ProductCard from '../components/ProductCard';
import Seo from '../components/Seo';
import { products } from '../data/products';

export default function SkinCare() {
  const skincareItems = products.filter((item) => item.category === 'Skin Care');

  return (
    <Layout>
      <Seo
        title="Skincare"
        description="Find simple skincare picks and glow-boosting essentials for a radiant everyday routine."
      />
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionTitle eyebrow="Skin Care" title="Gentle glow boosters" description="Simple, comforting favourites for radiant daily care." />
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {skincareItems.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </Layout>
  );
}
