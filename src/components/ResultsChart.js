// src/components/ResultsChart.jsx
'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts';

// Define theme colors for the chart to match your dark theme
const themeColors = {
  background: '#0f172a', // slate-900
  card: '#1e293b',       // slate-800
  text: '#cbd5e1',       // slate-300 (For axis labels, legends)
  grid: '#334155',       // slate-700 (For grid lines)
  accent: '#06b6d4',     // cyan-500 (For bars)
  accentMuted: 'rgb(51 65 85 / 0.5)' // slate-700 @ 50% (For tooltip cursor)
};

export default function ResultsChart({ data }) {
  // The data prop will be the 'candidates' array from a campaign
  return (
    // Use Tailwind classes for the container, matching other cards
    <div className="bg-slate-800 shadow-lg rounded-lg p-4 md:p-6 w-full h-[400px]">
      <ResponsiveContainer>
        <BarChart
          data={data}
          margin={{
            top: 10,  // Added a bit more top margin for the legend
            right: 0, // No right margin
            left: -20, // Nudge left to account for Y-axis label padding
            bottom: 0, // No bottom margin
          }}
        >
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke={themeColors.grid} // Dark grid lines
          />
          <XAxis 
            dataKey="name" 
            stroke={themeColors.text} // Light text
            tickLine={false} // Cleaner look
            axisLine={false} // Cleaner look
            fontSize={12}
          />
          <YAxis 
            allowDecimals={false} 
            stroke={themeColors.text} // Light text
            tickLine={false} // Cleaner look
            axisLine={false} // Cleaner look
            fontSize={12}
          />
          <Tooltip
            cursor={{ fill: themeColors.accentMuted }} // Hover-over bar column color
            contentStyle={{ 
              backgroundColor: 'rgb(15 23 42 / 0.9)', // slate-900 with opacity
              borderRadius: '0.5rem', 
              border: `1px solid ${themeColors.grid}` 
            }}
            labelStyle={{ color: '#e2e8f0' }} // slate-200
            itemStyle={{ color: themeColors.accent, fontWeight: 'bold' }}
          />
          <Legend 
            wrapperStyle={{ 
              color: themeColors.text, 
              paddingTop: '10px' // Add space above legend
            }} 
          />
          <Bar 
            dataKey="votes" 
            fill={themeColors.accent} // Main accent color (cyan-500)
            radius={[4, 4, 0, 0]} // Rounded top corners for bars
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
