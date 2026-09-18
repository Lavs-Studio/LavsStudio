import Layout from '../components/Layout';
import SectionTitle from '../components/SectionTitle';
import ProductCard from '../components/ProductCard';
import Seo from '../components/Seo';
import useRemoteData from '../hooks/useRemoteData';
import { fetchPublishedProducts } from '../lib/content';

export default function Jewellery() {
  const [products, isLoading, error] = useRemoteData(fetchPublishedProducts, []);
  const jewelleryItems = products.filter(
    (item) =>
      item.category?.toLowerCase() === 'jewellery' ||
      item.category?.toLowerCase() === 'jewelry' ||
      item.category_slug === 'jewellery'
  );

  return (
    <Layout>
      <Seo
        title="Jewellery Picks"
        description="Discover dainty gold jewellery, layered chains, and everyday minimal accessories curated by Lavs Studio."
      />
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <SectionTitle
          eyebrow="Jewellery"
          title="Dainty everyday sparkle"
          description="Minimal hoops, sleek chains, and subtle shine for your daily routine."
        />

        {error && (
          <div className="mb-8 rounded-2xl border border-[#ec4899]/30 bg-[#fde8f3] p-4 text-center text-sm text-[#ec4899]">
            Unable to connect to live database.
          </div>
        )}

        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="animate-pulse overflow-hidden rounded-[28px] border border-[#e9d5ff]/80 bg-white/90 p-4 backdrop-blur-xl"
              >
                <div className="h-48 w-full rounded-[20px] bg-[#f3e8ff]/70" />
                <div className="mt-4 h-5 w-3/4 rounded bg-[#f3e8ff]" />
                <div className="mt-2 h-4 w-1/2 rounded bg-[#f3e8ff]/60" />
              </div>
            ))}
          </div>
        ) : jewelleryItems.length === 0 ? (
          <div className="rounded-[32px] border border-[#e9d5ff]/80 bg-white/90 p-12 text-center shadow-xl shadow-purple-950/5 backdrop-blur-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-[#ec4899]">
              Jewellery Collection
            </p>
            <h3 className="mt-2 text-2xl font-bold text-[#2e1f3b]">
              No published jewellery items found
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-[#2e1f3b]/75">
              Check back soon for new jewellery picks!
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {jewelleryItems.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

      </section>
    </Layout>
  );
}

