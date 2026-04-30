interface StatCardProps {
  title: string; value: string | number; subtitle?: string;
  icon: React.ReactNode; color: string; delay?: number;
}

export default function StatCard({ title, value, subtitle, icon, color, delay = 0 }: StatCardProps) {
  return (
    <div className={`stat-card animate-in bg-white rounded-2xl p-5 shadow-card delay-${delay}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-slate-500 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold mt-1 text-slate-800" style={{ fontFamily: "var(--font-display)" }}>
            {value}
          </p>
          {subtitle && <p className="text-slate-400 text-xs mt-1">{subtitle}</p>}
        </div>
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white`} style={{ background: color }}>
          {icon}
        </div>
      </div>
    </div>
  );
}
