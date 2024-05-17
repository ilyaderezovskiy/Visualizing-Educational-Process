import React, { useRef, useEffect } from "react";
import SankeyFun from "./SankeyFun.js";

const saveSvgAsPng = require('save-svg-as-png');

const imageOptions = {
  encoderOptions: 1,
  backgroundColor: 'white',
}

// Функция проверки, является ли массив пустым
function isEmpty(obj) {
  for (var prop in obj) {
      if (obj.hasOwnProperty(prop)) {
          return false;
      }
  }
  return true;
}

function CallSankey({ data, vertices }) {
  var svgRef = useRef(null);

  // Вызов построения моделя для визуализации
  useEffect(() => {
    SankeyFun(
      { links: data, svgRef, vertices },
      {
        height: 660, // 700
        width: isEmpty(vertices) ? 2900 : localStorage.getItem('nodesNumber' + vertices.name) * 290, //2900
        nodeGroup: (d) => d.id.split(/\W/)[0]
      }
    );
  }, [data]);

  // Сохранение изображение визуализации
  var saveAsPng = () => {
    saveSvgAsPng.saveSvgAsPng(document.getElementById("chart"), 'chart.png', imageOptions);
  };

  return (
    <div className="home">
      <svg id="chart" ref={svgRef} />
      <button onClick={saveAsPng}>Save as PNG</button>
    </div>
  );
}

export default CallSankey;
