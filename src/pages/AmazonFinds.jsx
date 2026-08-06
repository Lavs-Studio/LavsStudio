import Layout from '../components/Layout';
import SectionTitle from '../components/SectionTitle';
import ProductCard from '../components/ProductCard';
import Seo from '../components/Seo';
import { products } from '../data/products';

export default function AmazonFinds() {
  return (
    <Layout>
      <Seo
        title="Amazon Finds"
        description="Browse curated Amazon Finds for affordable fashion, beauty, jewellery and lifestyle essentials with a Pinterest-inspired feel."
      />
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionTitle eyebrow="Amazon finds" title="The latest little luxuries" description="Everyday staples that feel a little more special." />
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {products.filter((item) => item.category === 'Amazon Finds' || item.category === 'Fashion' || item.category === 'Skin Care').map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </Layout>
  );
}
