import AffiliateButton from './AffiliateButton';

export default function ProductRecommendation({ product }) {
  return (
    <div className="rounded-[24px] border border-rose/20 bg-white p-5 shadow-soft">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-rose">{product.category}</p>
          <h3 className="mt-2 text-lg font-semibold">{product.title}</h3>
          <p className="mt-2 text-sm text-espresso/70">{product.description}</p>
        </div>
        <span className="rounded-full bg-cream px-3 py-1 text-sm text-espresso/70">{product.badge}</span>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <span className="text-lg font-semibold">{product.price}</span>
        <AffiliateButton label="View Placeholder Amazon Link" />
      </div>
    </div>
  );
}
