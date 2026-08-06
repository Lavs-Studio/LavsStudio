export default function SectionTitle({ eyebrow, title, description }) {
  return (
    <div className="mb-8 max-w-2xl">
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-rose">{eyebrow}</p>
      <h2 className="mt-2 text-3xl font-semibold sm:text-4xl">{title}</h2>
      {description && <p className="mt-3 text-base text-espresso/70">{description}</p>}
    </div>
  );
}
