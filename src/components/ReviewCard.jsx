export default function ReviewCard({ name, title, review }) {
  return (
    <div className="rounded-[24px] border border-rose/20 bg-cream p-5 shadow-soft">
      <p className="text-sm text-espresso/70">“{review}”</p>
      <div className="mt-4">
        <p className="font-semibold">{name}</p>
        <p className="text-sm text-espresso/60">{title}</p>
      </div>
    </div>
  );
}
