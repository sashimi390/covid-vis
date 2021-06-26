import * as d3 from "d3";
import { useEffect, useState } from "react";

function VerticalAxis({ scale, val }) {
  const strokeColor = "#888";
  const x = 0;
  const [y1, y2] = scale.range();
  return (
    <g>
      <line x1={x} y1={y1} x2={x} y2={y2} stroke={strokeColor} />
      <g>
        {scale.ticks().map((y) => {
          return (
            <g transform={`translate(0,${scale(y)})`}>
              <line
                x1="0"
                y1={scale(y)}
                x2="-5"
                y2={scale(y)}
                stroke={strokeColor}
              />
              <text
                x="-5"
                textAnchor="end"
                dominantBaseline="central"
                fontSize="12"
              >
                {y}
              </text>
            </g>
          );
        })}
        <text
          textAnchor="end"
          dominantBaseline="central"
          fontSize="12"
          transform="translate(-40,200)rotate(-90)"
        >
          {val}
        </text>
        ;
      </g>
    </g>
  );
}

function HorizontalAxis({ scale, val }) {
  const strokeColor = "#888";
  const y = 400;
  const [x1, x2] = scale.range();
  return (
    <g>
      <line x1={x1} y1={y} x2={x2} y2={y} stroke={strokeColor} />
      <g>
        {scale.ticks().map((x) => {
          return (
            <g transform={`translate(${scale(x)},400)`}>
              <line y1="-10" y2="0" stroke={strokeColor} />
              <text
                y="15"
                textAnchor="middle"
                dominantBaseline="center"
                fontSize="12"
              >
                {x}
              </text>
            </g>
          );
        })}
      </g>
      <text
        textAnchor="end"
        dominantBaseline="central"
        fontSize="12"
        transform="translate(250,430)"
      >
        {val}
      </text>
    </g>
  );
}

function Legend({ color }) {
  return (
    <g>
      {color.domain().map((data, i) => {
        return (
          <g key={i} transform={`translate(420,${i * 20})`}>
            <circle r="5" fill={color(data)} />
            <text x="10" y="3" fontSize="12">
              {data}{" "}
            </text>
          </g>
        );
      })}
    </g>
  );
}

export default function App() {
  const margin = {
    top: 10,
    bottom: 50,
    left: 50,
    right: 100,
  };
  const contentWidth = 400;
  const contentHeight = 400;

  const [data, setData] = useState([]);

  useEffect(() => {
    (async () => {
      const request = await fetch("data.json");
      const data = await request.json();
      setData(data);
    })();
  }, []);

  const [xProperty, setXProperty] = useState("Positive");

  const handleChangeX = (event) => {
    setXProperty(event.target.value);
  };

  const [yProperty, setYProperty] = useState("Tested");
  const handleChangeY = (event) => {
    setYProperty(event.target.value);
  };
  console.log(xProperty);
  console.log(yProperty);

  const xScale = d3
    .scaleLinear()
    .domain(d3.extent(data, (item) => item[xProperty]))
    .range([0, contentWidth])
    .nice();

  const yScale = d3
    .scaleLinear()
    .domain(d3.extent(data, (item) => item[yProperty]))
    .range([contentHeight, 0])
    .nice();

  const colorScale = d3.scaleOrdinal(d3.schemeSet2);

  const svgWidth = margin.right + margin.left + contentWidth;
  const svgHeight = margin.top + margin.bottom + contentHeight;
  console.log(data);

  return (
    <div>
      <div>
        <form>
          <label className="label">xProperty</label>
          <select onChange={handleChangeX}>
            <option value="Hokkaido">北海道</option>
            <option value="Tokyo">東京都</option>
            <option value="Kanagawa">神奈川県</option>
            <option value="Osaka"> 大阪府</option>
            <option value="Okinawa"> 沖縄県</option>
          </select>
        </form>
      </div>
      <div>
        <form>
          <label>yProperty</label>
          <select onChange={handleChangeY}>
            <option value="Hokkaido">北海道</option>
            <option value="Tokyo">東京都</option>
            <option value="Kanagawa">神奈川県</option>
            <option value="Osaka"> 大阪府</option>
            <option value="Okinawa"> 沖縄県</option>
          </select>
        </form>
      </div>

      <svg
        viewBox={`${-margin.left} ${-margin.top} ${svgWidth} ${svgHeight}`}
        style={{ border: "Solid 1px" }}
      >
        <VerticalAxis scale={yScale} val={yProperty} />
        <HorizontalAxis scale={xScale} val={xProperty} />
        <Legend color={colorScale} />
        <g>
          {data.map((item, i) => {
            return (
              <circle
                className="move"
                key={i}
                cx={xScale(item[xProperty])}
                cy={yScale(item[yProperty])}
                r="5"
                fill={colorScale(item.prefE)}
                style={{
                  transitionDuration: "1s",
                  transitionProperty: "all",
                }}
              />
            );
          })}
        </g>
      </svg>
    </div>
  );
}
