"use client";

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

interface RechartsChartProps {
  data: Array<{ month: string; revenue: number }>;
}

export default function RechartsChart({ data }: RechartsChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-[300px] w-full items-center justify-center">
        <p className="text-muted-foreground">Ainda não há dados de vendas para mostrar.</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip 
          contentStyle={{
            backgroundColor: "hsl(var(--background))",
            borderColor: "hsl(var(--border))"
          }}
        />
        <Bar dataKey="revenue" fill="hsl(var(--primary))" name="Rendimento" unit="€" />
      </BarChart>
    </ResponsiveContainer>
  );
}
