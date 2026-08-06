export default function ProductCard({ product }) {
  return (
    <article className="overflow-hidden rounded-[28px] border border-rose/20 bg-white shadow-soft transition duration-300 hover:-translate-y-1">
      <img src={product.image} alt={`${product.title} featured on Lavs Studio`} className="h-56 w-full object-cover" />
      <div className="p-5">
        <p className="text-xs uppercase tracking-[0.25em] text-rose">{product.category}</p>
        <h3 className="mt-2 text-xl font-semibold">{product.title}</h3>
        <p className="mt-2 text-sm text-espresso/70">{product.description}</p>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-lg font-semibold">{product.price}</span>
          <button className="rounded-full bg-espresso px-4 py-2 text-sm text-white transition hover:bg-rose">
            View on Amazon
          </button>
        </div>
      </div>
    </article>
  );
}
