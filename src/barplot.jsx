import * as d3 from "d3";

export default function BarPlot({ data }) {
  const width = 500;
  const height = 400;
  const margin = { top: 20, right: 30, bottom: 30, left: 200 };

  // Y scale: countries
  const yScale = d3
    .scaleBand()
    .domain(data.map((d) => d.country))
    .range([margin.top, height - margin.bottom])
    .padding(0.2);

  // X scale: students
  const xScale = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => d.students)])
    .range([0, width - margin.left - margin.right]);

  return (
    <svg width={width} height={height}>
      {data.map((d) => (
        <g key={d.country}>
          {/* Bar */}
          <rect
            x={margin.left}
            y={yScale(d.country)}
            width={xScale(d.students)}
            height={yScale.bandwidth()}
            fill="steelblue"
          />

          {/* Country label */}
          <text
            x={margin.left - 10}
            y={yScale(d.country) + yScale.bandwidth() / 2}
            textAnchor="end"
            dominantBaseline="middle"
          >
            {d.country}
          </text>

          {/* Student value */}
          <text
            x={margin.left + xScale(d.students) + 5}
            y={yScale(d.country) + yScale.bandwidth() / 2}
            dominantBaseline="middle"
          >
            {d.students}
          </text>
        </g>
      ))}
    </svg>
  );
}
