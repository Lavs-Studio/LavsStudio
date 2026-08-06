import Layout from '../components/Layout';
import SectionTitle from '../components/SectionTitle';
import ProductCard from '../components/ProductCard';
import Seo from '../components/Seo';
import { products } from '../data/products';

export default function Categories() {
  return (
    <Layout>
      <Seo
        title="Categories"
        description="Browse categories for Amazon Finds, affordable fashion, college girl fashion, hair care, skincare and jewellery recommendations."
      />
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionTitle eyebrow="Categories" title="Explore all the curated picks" description="A beautiful collection of favourites across fashion, beauty, and lifestyle." />
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </Layout>
  );
}
