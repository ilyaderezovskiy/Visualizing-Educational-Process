// Заполнение данных для фильтрации графика по степени точности визуализации вершин и переходов
export default function LoadSankeyData(load, filterData, minMax, initSlider, minMaxNode, initSliderNode, nodes, energy2, vertices2) {
  const setInit = load;
  const setSankeyData = filterData;
  const setMinMax = minMax;
  const setMinMax2 = initSlider;
  const setMinMaxNode = minMaxNode;
  const setMinMax2Node = initSliderNode;
  const setNodes = nodes;

  var nodesTo = [];
  var nodesFrom = [];
  var nodeValue = [];
  var k = false;

  const uniqueArray = (objects, uniqueBy, keepFirst = true) => {
    return Array.from(
      objects.reduce((map, e) => {
        let key = uniqueBy.map(key => [e[key], typeof e[key]]).flat().join('-')
        if (keepFirst && map.has(key)) return map
        return map.set(key, e)
      }, new Map()).values()
    )
  }

  var el = [];
  var maxEl = 0;
  var results = {};

  for (let key in energy2) {
    results[key] = energy2[key];
  }
  results.data = energy2.data.map((element) => element);
  var data = results.data.map(function(item){return {'source': item.source, 'target': item.target};});
  var uniqueData = uniqueArray(data, ['source', 'target'], true);

  Array.prototype.forEach.call(uniqueData, element => {
    var value = 0;
    Array.prototype.forEach.call(data, element2 => {
      if (element2.source === element.source && element2.target === element.target) {
        value += 1;
      }
    });
    el.push({'source': element.source, 'target': element.target, 'value': value, 'valueLabel': value })
  });

  results.data = el;
  // setSankeyData(results.data);
  // setInit(results.data);

  setMinMax([
    Math.min(...results.data.map((o) => o.value)),
    Math.max(...results.data.map((o) => o.value))
  ]);
  setMinMax2([
    Math.min(...results.data.map((o) => o.value)),
    Math.max(...results.data.map((o) => o.value))
  ]);
        
  if (!k) {
    results.data.forEach(element => {
      if (!element.source.includes('col')) {
        if (!nodesTo[element.target]) {
          nodesTo[element.target] = 0;
        }
        if (!nodesFrom[element.source]) {
          nodesFrom[element.source] = 0;
        }
        nodesTo[element.target] += element.value;
        nodesFrom[element.source] += element.value;
      }
    });
    for (var node in nodesFrom) {
      if (!nodesTo[node]) {
        nodesTo[node] = nodesFrom[node];
      }
    }
    for (var node in nodesTo) {
      nodeValue.push(nodesTo[node]);
    }
  };

  k = true;
  setMinMaxNode([
    Math.min(...nodeValue.map((o) => o)) - 1,
    Math.max(...nodeValue.map((o) => o))
  ]);
  setMinMax2Node([
    Math.min(...nodeValue.map((o) => o)) - 1,
    Math.max(...nodeValue.map((o) => o))
  ]);
  setNodes(nodesTo);
  maxEl = Math.floor(Math.max(...nodeValue.map((o) => o)) / 5) + 0.9;

  vertices2.data.forEach(element => {
    if (element.source.includes('col ')) {
      element.value = maxEl;
      element.valueLabel = maxEl;
    } else {
      element.value = maxEl / 1.5;
      element.valueLabel = maxEl / 1.5;
    }
    el.push(element);
  });
  setInit(el);
}
