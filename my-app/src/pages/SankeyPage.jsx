import { useEffect, useState } from "react";
import Sankey from "../components/Sankey";
import * as d3 from "d3";

function SankeyPage() {
  const [formattedData, setFormattedData] = useState();

  useEffect(() => {
    d3.csv("/sampleData.csv").then((data) => {
      // Extract unique source and target node names
      const uniqueNodes = Array.from(
        new Set([...data.map((d) => d.Source), ...data.map((d) => d.Target)])
      );

      // Map unique node names to node objects
      const nodes = uniqueNodes.map((name) => ({ name }));

      // Map data to links, using indices from uniqueNodes
      const links = data.map((d) => ({
        source: uniqueNodes.findIndex((n) => n === d.Source),
        target: uniqueNodes.findIndex((n) => n === d.Target),
        value: parseFloat(d["Value (THOUSAND TONS)"]),
      }));

      // Create formatted data object
      const formattedData = {
        nodes: nodes,
        links: links,
      };

      //   console.log(formattedData);
      setFormattedData(formattedData);
    });
  }, []);

  return formattedData ? (
    <Sankey data={formattedData} width={1000} height={600} />
  ) : null;
}

export default SankeyPage;
