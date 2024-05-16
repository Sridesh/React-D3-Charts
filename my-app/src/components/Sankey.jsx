import * as d3 from "d3";
import { sankey, sankeyLinkHorizontal } from "d3-sankey";
import { useState, useEffect, useRef } from "react";
import tinycolor from "tinycolor2";

const MARGIN_Y = 25;
const MARGIN_X = 5;
const COLORS = ["#e0ac2b", "#e85252", "#6689c6", "#9a6fb0", "#a53253"];

function Sankey({ data, width, height }) {
  const allGroups = [...new Set(data.nodes.map((d) => d.name))].sort();
  const colorScale = d3.scaleOrdinal(d3.schemePaired).domain(allGroups);
  console.log(allGroups);
  const svgRef = useRef();

  console.log(data);
  let allLabels = null;

  useEffect(() => {
    if (!data) return;

    const margin = { top: 10, right: 10, bottom: 10, left: 10 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    // const width = svgRef.current.parentElement.clientWidth; // Adjust the width dynamically
    // const height = 400; // Set a fixed height

    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height);

    const sankeyGenerator = sankey()
      .nodeWidth(15)
      .nodePadding(10)
      .extent([
        [1, 1],
        [innerWidth - 1, innerHeight - 6],
      ]);

    const { nodes, links } = sankeyGenerator(data);

    const gradient = svg
      .append("defs")
      .selectAll("linearGradient")
      .data(links)
      .enter()
      .append("linearGradient")
      .attr("id", (d, i) => "gradient" + i)
      .attr("gradientUnits", "userSpaceOnUse")
      .attr("x1", (d) => d.source.x1)
      .attr("x2", (d) => d.target.x0);

    gradient
      .append("stop")
      .attr("offset", "0%")
      .attr("stop-color", (d) => {
        return colorScale(nodes[d.source.index].name);
      })
      .attr("stop-opacity", 1);

    gradient
      .append("stop")
      .attr("offset", "100%")
      .attr("stop-color", (d) => {
        return colorScale(nodes[d.target.index].name);
      })
      .attr("stop-opacity", 1);

    const nodeGroup = svg
      .append("g")
      .attr("class", "nodes")
      .selectAll("rect")
      .data(nodes)
      .join("rect")
      .attr("x", (d) => d.x0)
      .attr("y", (d) => d.y0)
      .attr("height", (d) => {
        return d.y1 - d.y0 > 0 ? d.y1 - d.y0 : 1;
      })
      .attr("width", (d) => d.x1 - d.x0)
      .attr("fill", (d) => colorScale(d.name))
      .style("stroke", (d) => tinycolor(colorScale(d.name)).darken())
      .append("title")
      .text((d) => `${d.name}`);

    nodeGroup
      .append("text")
      .attr("x", (d) => d.x0 + 5) // Adjust x position for better placement
      .attr("y", (d) => (d.y1 + d.y0) / 2) // Center label vertically
      .attr("dominant-baseline", "middle") // Align text to the middle of the node
      .text((d) => d.name)
      .attr("fill", "black"); // Set label text color

    svg
      .append("g")
      .attr("class", "links")
      .selectAll(".link")
      .data(links)
      .join("path")
      .attr("class", "link")
      .attr("d", sankeyLinkHorizontal())
      .style("stroke", (d, i) => `url(#gradient${i})`)
      .style("stroke-width", (d) => Math.max(1, d.width))
      .style("fill", "none")
      .style("stroke-opacity", 0.5)
      .append("title")
      .text((d) => `${d.source.name} → ${d.target.name}\n${d.value}`);
  }, [data, width, height]);

  return <svg ref={svgRef}></svg>;
}

export default Sankey;
