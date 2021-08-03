import * as d3 from "d3";
import { useEffect, useState } from "react";

function Header() {
  return (
    <header className="hero is-small is-success	 is-bold">
      <div className="hero-body">
        <h1 className="title">Covid-19</h1>
        <p className="subtitle">5都道府県の比較</p>
      </div>
    </header>
  );
}

function VerticalAxis({ scale, val }) {
  const strokeColor = "#888";
  const x = 0;
  const [y1, y2] = scale.range();
  return (
    <g>
      <line x1={x} y1={y1} x2={x} y2={y2} stroke={strokeColor} />
      <g>
        {scale.ticks().map((y, i) => {
          return (
            <g key={i} transform={`translate(0,${scale(y)})`}>
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
          transform="translate(-60,200)rotate(-90)"
        >
          {val}
        </text>
        ;
      </g>
    </g>
  );
}

function HorizontalAxis({ scale, val, x2 }) {
  const strokeColor = "#888";
  const y = 500;

  return (
    <g>
      <line x1={0} y1={y} x2={800} y2={y} stroke={strokeColor} />
      <g>
        {scale.map((x, i) => {
          return (
            <g
              key={i}
              transform={`translate(${
                x2(new Date(x)) - 5
              },523)rotate(-90)scale(0.5)`}
            >
              <text
                y="15"
                textAnchor="middle"
                dominantBaseline="center"
                fontSize="14"
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
        fontSize="10"
        transform="translate(413,537)"
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
          <g key={i} transform={`translate(830,${i * 20})`}>
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

function Footer() {
  return (
    <footer className="footer">
      <div className="content has-text-centered">
        <p> From COVID-19</p>
        <p>
          <a href="https://www3.nhk.or.jp/news/special/coronavirus/">
            When will the COVID-19 problem settle down?
          </a>
        </p>
        <a href="https://japan-virus.netlify.app/">前回のサイトはこちら</a>
      </div>
    </footer>
  );
}

export default function App() {
  const margin = {
    top: 10,
    bottom: 50,
    left: 70,
    right: 100,
  };
  const contentWidth = 800;
  const contentHeight = 500;

  const [data, setData] = useState([]);
  const [data2, setData2] = useState([]);
  const [showData, setShowData] = useState(undefined);
  const [mousePosition, setMousePosition] = useState([0, 0]);
  //mousePosition->mouseがいるところ [0]->x,[1]->y

  function overHandle(event, value) {
    console.log(event);
    //e.pageX or e.pageYでその画面内の座標がわかる
    setMousePosition([event.pageX, event.pageY]);
    setShowData(value);
  }

  function outHandle() {
    setShowData(undefined);
  }

  useEffect(() => {
    (async () => {
      const request = await fetch("covid_data.json");
      const data = await request.json();
      const request2 = await fetch("covid_data2.json");
      const data2 = await request2.json();
      setData(data);
      setData2(data2);
    })();
  }, []);

  const [xProperty, setXProperty] = useState("date");

  const [yProperty, setYProperty] = useState("testedPositive");
  const handleChangeY = (event) => {
    setYProperty(event.target.value);
  };

  /* 同じ日付が5つあって重複するからsliceで1つにする */
  const xScale = data.map((data) => data[xProperty]).slice(0, 24);
  /* console.log(xScale); */
  var x2 = d3
    .scaleTime()
    .domain(d3.extent(data, (d) => new Date(d.date)))
    .range([0, contentWidth]);

  const yScale = d3
    .scaleLinear()
    .domain(d3.extent(data, (item) => parseInt(item[yProperty])))
    .range([contentHeight, 0])
    .nice();

  const line = d3
    .line()
    .x(function (d) {
      return x2(new Date(d.date));
    })
    .y(function (d) {
      return yScale(d[yProperty]);
    });

  const colorScale = d3.scaleOrdinal(d3.schemeCategory10);
  /* console.log(colorScale); */

  const svgWidth = margin.right + margin.left + contentWidth;
  const svgHeight = margin.top + margin.bottom + contentHeight;

  return (
    <div>
      <Header />
      <div>
        <form>
          <label className="label">yProperty</label>
          <select onChange={handleChangeY}>
            <option value="testedPositive">陽性者数</option>
            <option value="peopleTested">PCR検査数</option>
            <option value="hospitalized">入院者数</option>
            <option value="serious">重症者数</option>
            <option value="deaths">死者数</option>
          </select>
        </form>
      </div>
      <svg
        viewBox={`${-margin.left} ${-margin.top} ${svgWidth} ${svgHeight}`}
        style={{ border: "Solid 1px" }}
      >
        <VerticalAxis scale={yScale} val={yProperty} />
        <HorizontalAxis scale={xScale} val={xProperty} x2={x2} />
        <Legend color={colorScale} />
        <g>
          {data.map((item, i) => {
            /*  console.log(item); */
            return (
              <circle
                className="move"
                key={i}
                cx={x2(new Date(item[xProperty]))}
                cy={yScale(item[yProperty])}
                r="5"
                fill={colorScale(item.prefectureNameJ)}
                style={{
                  transitionDuration: "1s",
                  transitionProperty: "all",
                }}
                onMouseEnter={(event) => overHandle(event, item[yProperty])}
              />
              /* overHandleが発生する */
            );
          })}
        </g>
        <g>
          {data2.map((item, i) => {
            return (
              <path
                key={i}
                stroke={colorScale(item.prefecture)}
                fill="none"
                d={line(item.values)}
                style={{
                  transitionDuration: "1s",
                  transitionProperty: "all",
                }}
              />
            );
          })}
        </g>
      </svg>
      {/* {三項演算子を使ってundefinedの時前者,そうでないとき後者 positionに+5とかするとちょっと判定範囲がいい感じになる} */}
      {showData !== undefined && ( //mouseOverにしてないときに出力したくない
        <div
          className="card show popup" //BULMAのやつ
          style={{
            position: "absolute",
            left: mousePosition[0],
            top: mousePosition[1] + 5,
          }}
          onMouseLeave={outHandle} //なんかいい感じになる
        >
          <div className="card-content">
            <div className="content">
              <p>{yProperty}</p>
              <p>{showData}</p>
            </div>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
}
