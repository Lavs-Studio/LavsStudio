export default function ProsConsSection({ pros = [], cons = [] }) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="rounded-[28px] border border-[#e9d5ff]/80 bg-white/90 p-6 backdrop-blur-xl shadow-xl shadow-purple-950/5">
        <h3 className="text-lg font-bold text-[#ec4899]">Pros</h3>
        <ul className="mt-3 space-y-2 text-sm text-[#2e1f3b]/80">
          {pros.map((item) => (
            <li key={item}>• {item}</li>
          ))}
        </ul>
      </div>
      <div className="rounded-[28px] border border-[#e9d5ff]/80 bg-white/90 p-6 backdrop-blur-xl shadow-xl shadow-purple-950/5">
        <h3 className="text-lg font-bold text-[#a855f7]">Cons</h3>
        <ul className="mt-3 space-y-2 text-sm text-[#2e1f3b]/80">
          {cons.map((item) => (
            <li key={item}>• {item}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}


