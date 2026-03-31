const stats = [
  {
    value: "7x",
    label: "More subs than GCs in the US",
  },
  {
    value: "$0",
    label: "Tools built exclusively for subs",
  },
  {
    value: "4+",
    label: "Apps a sub needs today to match SubBase",
  },
  {
    value: "1M+",
    label: "Subcontractors in the United States",
  },
];

export function Stats() {
  return (
    <section className="border-b-2 border-border bg-foreground text-background">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="font-mono text-4xl font-bold text-secondary md:text-5xl">
                {stat.value}
              </div>
              <p className="mt-2 text-sm text-background/80">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
