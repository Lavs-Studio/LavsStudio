import Layout from '../components/Layout';
import SectionTitle from '../components/SectionTitle';
import ProductCard from '../components/ProductCard';
import Seo from '../components/Seo';
import useRemoteData from '../hooks/useRemoteData';
import { fetchPublishedProducts } from '../lib/content';

export default function HairCare() {
  const [products, isLoading, error] = useRemoteData(fetchPublishedProducts, []);
  const hairCareItems = products.filter(
    (item) =>
      item.category?.toLowerCase() === 'hair care' ||
      item.category_slug === 'hair-care'
  );

  return (
    <Layout>
      <Seo
        title="Hair Care Routine"
        description="Nourishing serums, heatless styling tools, and routine staples for soft, healthy hair."
      />
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <SectionTitle
          eyebrow="Hair Care"
          title="Nourish for soft, healthy strands"
          description="Gentle hair oils, heatless accessories, and everyday hair care essentials."
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
        ) : hairCareItems.length === 0 ? (
          <div className="rounded-[32px] border border-[#e9d5ff]/80 bg-white/90 p-12 text-center shadow-xl shadow-purple-950/5 backdrop-blur-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-[#ec4899]">
              Hair Care Edit
            </p>
            <h3 className="mt-2 text-2xl font-bold text-[#2e1f3b]">
              No published hair care items found
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-[#2e1f3b]/75">
              Check back soon for new hair care recommendations!
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {hairCareItems.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

      </section>
    </Layout>
  );
}

