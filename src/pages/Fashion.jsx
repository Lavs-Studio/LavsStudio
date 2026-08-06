import Layout from '../components/Layout';
import SectionTitle from '../components/SectionTitle';
import ProductCard from '../components/ProductCard';
import Seo from '../components/Seo';
import { products } from '../data/products';

export default function Fashion() {
  const fashionItems = products.filter((item) => item.category === 'Fashion');

  return (
    <Layout>
      <Seo
        title="Affordable Fashion"
        description="Discover affordable fashion picks and college girl fashion inspiration curated for everyday style and Pinterest-worthy outfits."
      />
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionTitle eyebrow="Fashion" title="Soft, elevated essentials" description="Choose timeless pieces made for effortless style." />
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {fashionItems.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </Layout>
  );
}
