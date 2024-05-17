import * as d3 from "d3";
import * as d3Sankey from "d3-sankey";

// Функция проверки, является ли массив пустым
function isEmpty(obj) {
  for (var prop in obj) {
      if (obj.hasOwnProperty(prop)) {
        return false;
      }
  }
  return true;
}

export default function SankeyFun (
  { links, svgRef, vertices },
  {
    nodes,
    // an iterable of link objects (typically [{source, target}, …]
    format = ",", // a function or format specifier for values in titles
    align = "center", // convenience shorthand for nodeAlign
    nodeId = (d) => d.id, // given d in nodes, returns a unique identifier (string)
    nodeIndex = (d) => d.index,
    nodeGroup, // given d in nodes, returns an (ordinal) value for color
    nodeGroups, // an array of ordinal values representing the node groups
    nodeLabel, // given d in (computed) nodes, text to label the associated rect
    nodeTitle = (d) => `${d.id}\n${format(d.value)}`, // given d in (computed) nodes, hover text
    nodeAlign = align, // Sankey node alignment strategy: left, right, justify, center
    nodeWidth = 100, // width of node rects
    nodePadding = 1, //18, // vertical separation between adjacent nodes
    nodeLabelPadding = 6, // horizontal separation between node and label
    nodeStroke = "currentColor", // stroke around node rects
    nodeStrokeWidth, // width of stroke around node rects, in pixels
    nodeStrokeOpacity, // opacity of stroke around node rects
    nodeStrokeLinejoin, // line join for stroke around node rects
    linkSource = ({ source }) => source, // given d in links, returns a node identifier string
    linkTarget = ({ target }) => target, // given d in links, returns a node identifier string
    linkValue = ({ value }) => value, // given d in links, returns the quantitative value
    linkValueLabel = ({ valueLabel }) => valueLabel, // given d in links, returns the quantitative value
    linkPath = d3Sankey.sankeyLinkHorizontal(), // given d in (computed) links, returns the SVG path
    linkTitle = (d) => `${d.source.id} → ${d.target.id}\n${format(d.value)}`, // given d in (computed) links
    linkColor = "source-target", // source, target, source-target, or static color
    linkStrokeOpacity = 0.5, // link stroke opacity
    linkMixBlendMode = "multiply", // link blending mode
    colors =  [d3.color("grey").copy({opacity: 0.6})],//d3.schemeTableau10, // array of colors
    width = 640, // outer width, in pixels
    height = 400, // outer height, in pixels
    marginTop = 20, // top margin, in pixels
    marginRight = 1,//parseNodes.filter(el => el.includes('col ')).length > 5 ? -1000 : 1, // right margin, in pixels
    marginBottom = 5, // bottom margin, in pixels
    marginLeft = 1 // left margin, in pixels
  } = {}
) {

  var parseNodes = [];
  if (!isEmpty(vertices)) {
    var columns = vertices.resultData.data.map(function(item){return item;});
    localStorage.setItem('nodesNumber'+vertices.name, columns[0].length);

    for (let i = 0; i < Object.keys(columns[0]).length; i++) {
      parseNodes.push('col ' + columns[0][i]);
      for (let j = 1; j < Object.keys(columns).length; j++) {
        parseNodes.push(`col${i+1} ` + columns[j][i]);
        parseNodes.push(`1.` + columns[0][i] + ` ` + columns[j][i]); // парсить source и target и добавлять 1. и 2.
        parseNodes.push(`2.` + columns[0][i] + ` ` + columns[j][i]);
        parseNodes.push(`3.` + columns[0][i] + ` ` + columns[j][i]);
        parseNodes.push(columns[0][i] + ` ` + columns[j][i]);
      }
    }
  }
  
  // Convert nodeAlign from a name to a function (since d3-sankey is not part of core d3).
  if (typeof nodeAlign !== "function")
    nodeAlign =
      {
        left: d3Sankey.sankeyLeft,
        right: d3Sankey.sankeyRight,
        center: d3Sankey.sankeyCenter
      }[nodeAlign] ?? d3Sankey.sankeyJustify;

  // Compute values.
  const LI = [...Array(links.length).keys()];
  const LS = d3.map(links, linkSource).map(intern);
  const LT = d3.map(links, linkTarget).map(intern);
  const LV = d3.map(links, linkValue);
  const LVL = d3.map(links, linkValueLabel);

  if (nodes === undefined) {
    nodes = []
    var addedNodes = [];

    links.forEach(function (d) {
      addedNodes.push(d.source);
      addedNodes.push(d.target);
    });

    if (isEmpty(vertices)) {
      parseNodes = addedNodes;
    }

    var parseNodes2 = parseNodes.filter(item => addedNodes.includes(item));
      
    var i = 0;
    parseNodes2.forEach(function (d) {
      nodes.push({ "id": d, "index": i});
      i += 1;
    });
        
    //nodes = Array.from(d3.union(LS, LT), (id, index) => ({ id, index }));
  }

  const N = d3.map(nodes, nodeId).map(intern);
  const I = d3.map(nodes, nodeIndex).map(intern);
  const G = nodeGroup == null ? null : d3.map(nodes, nodeGroup).map(intern);

  // Replace the input nodes and links with mutable objects for the simulation.
  nodes = d3.map(nodes, (_, i) => ({ id: N[i], index: I[i] }));

  links = d3.map(links, (_, i) => ({
    index: LI[i],
    source: LS[i],
    target: LT[i],
    value: LV[i],
    valueLabel: LVL[i]
  }));

  const svg = d3.select(svgRef.current);

  svg.selectAll("*").remove();

  svg
  .attr("width", width)
  .attr("height", height)
  .style("white-space", "nowrap");

  const greyColor = d3.color("grey").copy({opacity: 0.4});
  const greenColor = d3.color("green").copy({opacity: 0.8});
  const blueColor = d3.color("steelblue").copy({opacity: 0.8});
  const whiteColor = d3.color("white").copy({opacity: 0.8});

  var nodeColors = {
  }

  var flowColors = {
  }

  nodes.forEach((element) => {
    if (element.id.includes('1.')) {
      nodeColors[element.index] = blueColor;
    } else if (element.id.includes('2.')) {
      nodeColors[element.index] = greenColor;
    } else if (element.id.includes('3.')) {
      getGradient(element.x0, element.x1, element.y0, element.y1);
      nodeColors[element.index] = "url(#svgGradient)";
    } else if (element.id.includes('col')) {
      nodeColors[element.index] = whiteColor;
    } else {
      nodeColors[element.index] = greyColor;
    }
  });

  var linkLabels = []

  links.forEach((element) => {
    linkLabels.push(element.value)
    if (element.source.includes('1.') && element.target.includes('1.')) {
      flowColors[element.index] = blueColor;
    } else if (element.source.includes('2.') && element.target.includes('2.')) {
      flowColors[element.index] = greenColor;
    } else if (element.source.includes('3.') && element.target.includes('3.')) {
      getGradient(element.source.x0, element.source.x1, element.source.y0, element.source.y1);
      flowColors[element.index] = "url(#svgGradient)";
    } else {
      flowColors[element.index] = greyColor;
    }
  });

  // Ignore a group-based linkColor option if no groups are specified.
  if (!G && ["source", "target", "source-target"].includes(linkColor))
    linkColor = "currentColor";

  // Compute default domains.
  if (G && nodeGroups === undefined) nodeGroups = G;
  // Construct the scales.
  const color = nodeGroup == null ? "null" : d3.scaleOrdinal(nodeGroups, colors);

  // Compute the Sankey layout.
  d3Sankey
    .sankey()
    .nodeId(({ index: i }) => N[i])
    .nodeAlign(nodeAlign)
    .nodeWidth(nodeWidth)
    .nodePadding(nodePadding)
    .nodeSort(null)
    .extent([
      [marginLeft, marginTop],
      [width - marginRight, height - marginBottom]
    ])({ nodes, links });

  // Compute titles and labels using layout nodes, so as to access aggregate values.
  if (typeof format !== "function") format = d3.format(format);
  const Tl =
    nodeLabel === undefined
      ? N
      : nodeLabel == null
      ? null
      : d3.map(nodes, nodeLabel);
  const Tt = nodeTitle == null ? null : d3.map(nodes, nodeTitle);
  const Lt = linkTitle == null ? null : d3.map(links, linkTitle);

  var nodeLabels = []
  nodes.forEach(element => {
    var val = 0;

    element.sourceLinks.forEach(element2 => {
      val += element2.valueLabel == null ? element2.value : element2.valueLabel
    });
    if (element.sourceLinks.length === 0) {
      element.targetLinks.forEach(element2 => {
        val += element2.valueLabel == null ? element2.value : element2.valueLabel
      });
    }
    nodeLabels[element.id] = val
  });

  // A unique identifier for clip paths (to avoid conflicts).
  const uid = `O-${Math.random().toString(16).slice(2)}`;

  const node = svg
    .append("g")
    .selectAll("rect")
    .data(nodes)
    .join("rect")
    .attr("rx",(d) => d.id.includes("col") ? 5 : 0)
    .attr("x", (d) => d.x0)
    .attr("y", (d) => d.y0)
    .attr("height", (d) => Math.max(4, d.y1 - d.y0))
    .attr("width", (d) => d.x1 - d.x0)
    .on("click", function(d) {
      if (!d.target.__data__.id.includes("col")) {
        // Выбор серой вершины
        if (nodeColors[d.target.__data__.index].r === 128) {
          // Выбор вершины первой подгруппы
          if (localStorage.getItem('group') === '0') {
            nodeColors[d.target.__data__.index] = blueColor;
            addFilter(0, d.target.__data__.id);
          // Выбор вершины второй подгруппы
          } else if (localStorage.getItem('group') === '1') {
            nodeColors[d.target.__data__.index] = greenColor;
            addFilter(1, d.target.__data__.id);
          }
        // Объединение вершин первой и второй подгруппы
        } else if (nodeColors[d.target.__data__.index].r === 70 && localStorage.getItem('group') === '1') {
          getGradient(d.target.__data__.x0, d.target.__data__.x1, d.target.__data__.y0, d.target.__data__.y1);
          nodeColors[d.target.__data__.index] = "url(#svgGradient)";
          addFilter(1, d.target.__data__.id);
        // Объединение вершин второй и первой подгруппы
        } else if (nodeColors[d.target.__data__.index].r === 0 && localStorage.getItem('group') === '0') {
          addFilter(0, d.target.__data__.id);
          getGradient(d.target.__data__.x0, d.target.__data__.x1, d.target.__data__.y0, d.target.__data__.y1);
          nodeColors[d.target.__data__.index] = "url(#svgGradient)";
        // Удаление выршины первой подгруппы из оъединения вершин двух подгруппы
        } else if (![128, 0, 70].includes(nodeColors[d.target.__data__.index].r) && localStorage.getItem('group') === '0') {
          nodeColors[d.target.__data__.index] = greenColor;
          removeFilter(0, d.target.__data__.id);
        // Удаление выршины второй подгруппы из оъединения вершин двух подгруппы
        } else if (![128, 0, 70].includes(nodeColors[d.target.__data__.index].r) && localStorage.getItem('group') === '1') {
          nodeColors[d.target.__data__.index] = blueColor;
          removeFilter(1, d.target.__data__.id);
        } else {
          // Удаление выршины первой подгруппы
          if (nodeColors[d.target.__data__.index].r === 70) {
            removeFilter(0, d.target.__data__.id);
          } else if (nodeColors[d.target.__data__.index].r === 0) {
            removeFilter(1, d.target.__data__.id);
          }
          nodeColors[d.target.__data__.index] = greyColor;
        }

        node.attr("fill", ({ index: i }) => nodeColors[i]);
      }
  });

  if (G) node.attr("fill", ({ index: i }) => nodeColors[i]);
  if (Tt) node.append("title").text(({ index: i }) => {
    return !Tt[i].includes("col") ? Tt[i] : ""; //+ "\ninfo" : "";
  })

  const link = svg
    .append("g")
    .attr("fill", "none")
    .attr("stroke-opacity", linkStrokeOpacity)
    .selectAll("g")
    .data(links)
    .join("g")
    .append("path")
    .attr("d", linkPath)
    .attr(
      "stroke", d => d.source.id.includes("col") ? "#00000000" : color(G[0])
    )
    .style("stroke-width", ({ width }) => Math.max(4, width - 4))
    .call(
      Lt
        ? (path) => path.append("title").text(({ index: i }) => {
          return !Lt[i].includes("col") ? Lt[i] : ""; //+ "\ninfo" : "";
        })
        : () => {}
    )
    .on("click", function(d) {

      if (!d.target.__data__.source.id.includes("col")) {
        if (nodeColors[d.target.__data__.source.index].r === 128 || nodeColors[d.target.__data__.target.index].r === 128) {
          getGradient(d.target.__data__.source.x0, d.target.__data__.source.x1, d.target.__data__.source.y0, d.target.__data__.source.y1);
          if (localStorage.getItem('group') === '0') {
            if (nodeColors[d.target.__data__.source.index].r === 0) {
              nodeColors[d.target.__data__.source.index] =  "url(#svgGradient)";
              nodeColors[d.target.__data__.target.index] =  blueColor;
              flowColors[d.target.__data__.index] = blueColor;
            } else if (nodeColors[d.target.__data__.target.index].r === 0) {
              nodeColors[d.target.__data__.source.index] =  blueColor;
              nodeColors[d.target.__data__.target.index] =  "url(#svgGradient)";
              flowColors[d.target.__data__.index] = blueColor;
            } else {
              nodeColors[d.target.__data__.source.index] =  blueColor;
              nodeColors[d.target.__data__.target.index] =  blueColor;
              flowColors[d.target.__data__.index] = blueColor;
            }
            addFilter(0, d.target.__data__.source.id);
            addFilter(0, d.target.__data__.target.id);
          } else if (localStorage.getItem('group') === '1') {
            if (nodeColors[d.target.__data__.source.index].r === 70) {
              nodeColors[d.target.__data__.source.index] =  "url(#svgGradient)";
              nodeColors[d.target.__data__.target.index] =  greenColor;
              flowColors[d.target.__data__.index] = greenColor;
            } else if (nodeColors[d.target.__data__.target.index].r === 70) {
              nodeColors[d.target.__data__.source.index] =  greenColor;
              nodeColors[d.target.__data__.target.index] =  "url(#svgGradient)";
              flowColors[d.target.__data__.index] = greenColor;
            } else {
              nodeColors[d.target.__data__.source.index] =  greenColor;
              nodeColors[d.target.__data__.target.index] =  greenColor;
              flowColors[d.target.__data__.index] = greenColor;
            }
            addFilter(1, d.target.__data__.source.id);
            addFilter(1, d.target.__data__.target.id);
          }
        } else if (nodeColors[d.target.__data__.source.index].r !== 128 && nodeColors[d.target.__data__.target.index].r !== 128) {
          getGradient(d.target.__data__.source.x0, d.target.__data__.source.x1, d.target.__data__.source.y0, d.target.__data__.source.y1);
          if (flowColors[d.target.__data__.index].r !== 128) {
            if (flowColors[d.target.__data__.index].r === 0 && localStorage.getItem('group') === '0') {
              nodeColors[d.target.__data__.source.index] = "url(#svgGradient)";
              nodeColors[d.target.__data__.target.index] = "url(#svgGradient)";
              flowColors[d.target.__data__.index] = blueColor;
              addFilter(0, d.target.__data__.source.id);
              addFilter(0, d.target.__data__.target.id);
            } else if (flowColors[d.target.__data__.index].r === 70 && localStorage.getItem('group') === '1') {
              nodeColors[d.target.__data__.source.index] = "url(#svgGradient)";
              nodeColors[d.target.__data__.target.index] = "url(#svgGradient)";
              flowColors[d.target.__data__.index] = greenColor;
              addFilter(1, d.target.__data__.source.id);
              addFilter(1, d.target.__data__.target.id);
            } else {
              flowColors[d.target.__data__.index] = greyColor;
            }
          } else {
            if (localStorage.getItem('group') === '0') {
              if (nodeColors[d.target.__data__.source.index].r === 0) {
                nodeColors[d.target.__data__.source.index] =  "url(#svgGradient)";
              }
              if (nodeColors[d.target.__data__.target.index].r === 0) {
                nodeColors[d.target.__data__.target.index] =  "url(#svgGradient)";
              } 
              flowColors[d.target.__data__.index] = blueColor;
              addFilter(0, d.target.__data__.source.id);
              addFilter(0, d.target.__data__.target.id);
            } else if (localStorage.getItem('group') === '1') {
              if (nodeColors[d.target.__data__.source.index].r === 70) {
                nodeColors[d.target.__data__.source.index] =  "url(#svgGradient)";
              } else if (nodeColors[d.target.__data__.target.index].r === 70) {
                nodeColors[d.target.__data__.target.index] =  "url(#svgGradient)";
              } 
              flowColors[d.target.__data__.index] = greenColor;
              addFilter(1, d.target.__data__.source.id);
              addFilter(1, d.target.__data__.target.id);
            }
            flowColors[d.target.__data__.index] = localStorage.getItem('group') === '0' ? blueColor : greenColor;
          }
        } else {
          flowColors[d.target.__data__.index] = greyColor;
        }

        link
          .attr(
            "stroke", d => {
              return d.source.id.includes("col") ? "#00000000" : flowColors[d.index];
            }
          )

        node.attr("fill", ({ index: i }) => nodeColors[i]);
      }
    });

  link
    .attr(
      "stroke", d => {
        return d.source.id.includes("col") ? "#00000000" : flowColors[d.index];
      }
    )

  // Add the link text
  svg.append("g").selectAll(".link")
    .data(links)
    .enter()
    .append("text")
    .attr('class', 'linkText')
    .attr("font-size", 14)
    .attr("x", function(d) { return d.target.x1 - nodeWidth - 20; })
    .attr("y", function(d) { return (d.y1); })
    .attr("dy", "0.35em")
    .attr("text-anchor", "end")
    .attr("transform", null)
    .text(function(d) { return !d.source.id.includes("col") & d.value !== 0 ? d.valueLabel : ""; })
    .attr("text-anchor", "end");

  if (Tl) {
    svg
      .append("g")
      .attr("font-family", "sans-serif")
      .attr("font-weight", "bold")
      .selectAll("text")
      .data(nodes)
      .join("text")
      .attr("font-size", (d) =>  (
        d.id.includes("col ") ? 17 : 15
      ))
      .attr("x", (d) => {
        if (d.id.includes("col ")) {
          return d.x0 < width / 2 ? d.x1 - nodeWidth + 1 : d.x0 - 6;
        } else {
          return d.x0 < width / 2 ? d.x1 - nodeWidth + 1 : d.x0 - 1;
        }
      }
        // d.x0 < width / 2 ? d.x1 - nodeWidth + 1 : d.x0 - 1
      )
      .attr("y", (d) => (d.y1 + d.y0) / 2)
      .attr("dy", "0.35em")
      .attr("text-anchor", "start")
      .text(({ index: i }) =>  {
        const tail = ([x,...xs]) => String(xs.join(" "));
        return String(Tl[i]).includes("col") ?  tail((String(Tl[i]).split(' '))) : ""; // String(Tl[i]).replace("col", '') : tail((String(Tl[i]).split(' ')));
      });

      svg
      .append("g")
      .attr("font-family", "sans-serif")
      .attr("font-size", 16)
      .attr("font-weight", "bold")
      .selectAll("text")
      .data(nodes)
      .join("text")
      .attr("x", (d) =>
        d.x0 < width / 2 ? d.x1 - nodeWidth + 10 : d.x0 + 10
      )
      .attr("y", (d) => (d.y1 + d.y0) / 2) //(d) => (d.y1 + d.y0) / 2 + 20)
      .attr("dy", "0.35em")
      .attr("text-anchor", "start")
      .text(({ index: i }) => !Tt[i].includes("col") & Tt[i].split('\n')[1] !== "0" ? nodeLabels[Tt[i].split('\n')[0]] : "");
  }

  function addFilter(groupNumer, filter) {
    if (groupNumer === 0) {
      var elements = localStorage.getItem('group1');
      if (!elements.includes(filter)) {
        localStorage.setItem('group1', elements + ' & ' + filter);
      }
    } else {
      var elements = localStorage.getItem('group2');
      if (!elements.includes(filter)) {
        localStorage.setItem('group2', elements + ' & ' + filter);
      }
    }
  }

  function removeFilter(groupNumer, filter) {
    if (groupNumer === 0) {
      var elements = localStorage.getItem('group1');
      localStorage.setItem('group1', elements.replace(' & ' + filter, ''));
    } else {
      var elements = localStorage.getItem('group2');
      localStorage.setItem('group2', elements.replace(' & ' + filter, ''));
    }
  }

  function intern(value) {
    return value !== null && typeof value === "object"
      ? value.valueOf()
      : value;
  }

  function getGradient(x1, x2, y1, y2) {
    var defs = svg.append("defs");

    var gradient = defs.append("linearGradient")
      .attr("id", "svgGradient")
      // .attr("gradientUnits", "userSpaceOnUse")
      .attr("x1", "0%")
      .attr("x2", "0%")
      .attr("y1", "0%")
      .attr("y2", "100%");

    gradient.append("stop")
      // .attr('class', 'end')
      .attr("offset", "40%")
      .attr("stop-color", blueColor)
      .attr("stop-opacity", 1);
      
    gradient.append("stop")
      // .attr('class', 'end')
      .attr("offset", "80%")
      .attr("stop-color", greenColor)
      .attr("stop-opacity", 1);
  }
  
  Object.assign(svg.node(), { scales: { color } });
}
