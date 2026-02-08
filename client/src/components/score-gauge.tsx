import { ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

interface ScoreGaugeProps {
  score: number;
  max?: number;
}

export function ScoreGauge({ score, max = 1000 }: ScoreGaugeProps) {
  // Color logic
  let color = "hsl(var(--destructive))"; // Red
  if (score >= 500) color = "hsl(var(--chart-3))"; // Orange
  if (score >= 700) color = "hsl(var(--chart-2))"; // Green

  const data = [
    { name: "Score", value: score, fill: color },
    { name: "Remaining", value: max - score, fill: "hsl(var(--muted))" },
  ];

  return (
    <div className="relative h-[200px] w-full flex flex-col items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="70%"
            startAngle={180}
            endAngle={0}
            innerRadius={60}
            outerRadius={80}
            paddingAngle={0}
            dataKey="value"
            stroke="none"
            cornerRadius={6}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute top-[60%] left-0 right-0 text-center transform -translate-y-1/2">
        <div className="text-4xl font-bold font-display" style={{ color }}>
          {score}
        </div>
        <div className="text-sm text-muted-foreground font-medium uppercase tracking-wider">
          Credit Score
        </div>
      </div>
    </div>
  );
}
