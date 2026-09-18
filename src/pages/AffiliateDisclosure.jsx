import Layout from '../components/Layout';
import Seo from '../components/Seo';
import AffiliateButton from '../components/AffiliateButton';
import ProductRecommendation from '../components/ProductRecommendation';
import ComparisonTable from '../components/ComparisonTable';
import ReviewCard from '../components/ReviewCard';
import ProsConsSection from '../components/ProsConsSection';
import useRemoteData from '../hooks/useRemoteData';
import { fetchPublishedPage, defaultPageCopy } from '../lib/content';
import { affiliateProducts, affiliateComparisonRows } from '../affiliate/data';

const fetchAffiliateDisclosurePage = () => fetchPublishedPage('affiliateDisclosure');

export default function AffiliateDisclosure() {
  const [page] = useRemoteData(fetchAffiliateDisclosurePage, defaultPageCopy.affiliateDisclosure);

  return (
    <Layout>
      <Seo
        title={page.title}
        description={page.description}
      />
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 space-y-8">
        <div className="rounded-[32px] border border-[#e9d5ff]/80 bg-white/90 p-8 shadow-xl shadow-purple-950/5 backdrop-blur-xl sm:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-[#ec4899]">{page.title}</p>
          <h1 className="mt-3 text-4xl font-bold text-[#2e1f3b] sm:text-5xl">{page.body || 'Amazon Associates-ready content structure'}</h1>
          <p className="mt-5 max-w-3xl text-lg text-[#2e1f3b]/75 leading-relaxed">{page.description}</p>
        </div>

        <div className="rounded-[28px] border border-[#e9d5ff]/80 bg-white/90 p-6 shadow-xl shadow-purple-950/5 backdrop-blur-xl">
          <h2 className="text-2xl font-bold text-[#2e1f3b]">Disclosure Banner</h2>
          <p className="mt-3 text-sm text-[#2e1f3b]/75 leading-relaxed">
            This site may earn a commission when you click on certain Amazon links. This does not affect the price you pay and helps support the content and recommendations on Lavs Studio.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-[28px] border border-[#e9d5ff]/80 bg-white/90 p-6 shadow-xl shadow-purple-950/5 backdrop-blur-xl">
            <h2 className="text-2xl font-bold text-[#2e1f3b]">Reusable Affiliate Button</h2>
            <div className="mt-4">
              <AffiliateButton label="Sample Amazon Button" />
            </div>
          </div>
          <div className="rounded-[28px] border border-[#e9d5ff]/80 bg-white/90 p-6 shadow-xl shadow-purple-950/5 backdrop-blur-xl">
            <h2 className="text-2xl font-bold text-[#2e1f3b]">Product Recommendation Component</h2>
            <div className="mt-4 space-y-4">
              {affiliateProducts.map((product) => (
                <ProductRecommendation key={product.id} product={product} />
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-[28px] border border-[#e9d5ff]/80 bg-white/90 p-6 shadow-xl shadow-purple-950/5 backdrop-blur-xl">
          <h2 className="text-2xl font-bold text-[#2e1f3b]">Comparison Table</h2>
          <div className="mt-4">
            <ComparisonTable rows={affiliateComparisonRows} />
          </div>
        </div>

        <div className="rounded-[28px] border border-[#e9d5ff]/80 bg-white/90 p-6 shadow-xl shadow-purple-950/5 backdrop-blur-xl">
          <h2 className="text-2xl font-bold text-[#2e1f3b]">Review Cards</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <ReviewCard name="Mina" title="College girl shopper" review="Easy to style and very affordable." />
            <ReviewCard name="Riya" title="Beauty lover" review="A soft and elevated everyday pick." />
            <ReviewCard name="Nia" title="Gift buyer" review="Elegant and easy to gift without overthinking." />
          </div>
        </div>

        <div className="rounded-[28px] border border-[#e9d5ff]/80 bg-white/90 p-6 shadow-xl shadow-purple-950/5 backdrop-blur-xl">
          <h2 className="text-2xl font-bold text-[#2e1f3b]">Pros and Cons</h2>
          <div className="mt-4">
            <ProsConsSection pros={['Affordable', 'Easy to style', 'Great for gifting']} cons={['Limited stock', 'Prices may shift', 'Some options need personal styling']} />
          </div>
        </div>
      </section>

    </Layout>
  );
}

