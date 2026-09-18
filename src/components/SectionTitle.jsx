export default function SectionTitle({ eyebrow, title, description }) {
  return (
    <div className="mb-8 max-w-2xl">
      <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#ec4899]">{eyebrow}</p>
      <h2 className="mt-2 text-3xl font-bold tracking-tight text-[#2e1f3b] sm:text-4xl">{title}</h2>
      {description && <p className="mt-3 text-base text-[#2e1f3b]/75 leading-relaxed">{description}</p>}
    </div>
  );
}



