export default function ProsConsSection({ pros = [], cons = [] }) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="rounded-[24px] border border-rose/20 bg-white p-6 shadow-soft">
        <h3 className="text-lg font-semibold">Pros</h3>
        <ul className="mt-3 space-y-2 text-sm text-espresso/70">
          {pros.map((item) => (
            <li key={item}>• {item}</li>
          ))}
        </ul>
      </div>
      <div className="rounded-[24px] border border-rose/20 bg-white p-6 shadow-soft">
        <h3 className="text-lg font-semibold">Cons</h3>
        <ul className="mt-3 space-y-2 text-sm text-espresso/70">
          {cons.map((item) => (
            <li key={item}>• {item}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
