'use client'

interface GoalItem {
  label: string
  done: number
  target: number
  rate: number
}

interface Props {
  goals: GoalItem[]
}

export function WeeklyGoals({ goals }: Props) {
  return (
    <div className="rounded-lg border border-[#1a2540] bg-[#0f1629] p-4">
      <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
        Objectifs de la semaine
      </p>
      <ul className="space-y-2.5">
        {goals.map((g) => {
          const color =
            g.rate >= 100 ? '#22c55e' :
            g.rate >= 70  ? '#3b82f6' :
            g.rate >= 40  ? '#f97316' :
            '#ef4444'

          return (
            <li key={g.label}>
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="text-slate-400 truncate max-w-[140px]">{g.label}</span>
                <span className="font-mono text-slate-500 shrink-0 ml-2">
                  {g.done}/{g.target}
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#1a2540]">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${g.target > 0 ? (g.done / g.target) * 100 : 0}%`,
                    backgroundColor: color,
                    transition: 'width 0.5s ease',
                  }}
                />
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
