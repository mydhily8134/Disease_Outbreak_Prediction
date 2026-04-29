import { useMemo, useState } from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { scaleQuantile } from "d3-scale";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const geoUrl = "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json";

interface GISMapProps {
  selectedDisease: string;
}

// Mapping from State Abbreviation to State Name (for matching with TopoJSON)
const stateAbbrToName: Record<string, string> = {
  AL: "Alabama", AK: "Alaska", AZ: "Arizona", AR: "Arkansas", CA: "California",
  CO: "Colorado", CT: "Connecticut", DE: "Delaware", FL: "Florida", GA: "Georgia",
  HI: "Hawaii", ID: "Idaho", IL: "Illinois", IN: "Indiana", IA: "Iowa",
  KS: "Kansas", KY: "Kentucky", LA: "Louisiana", ME: "Maine", MD: "Maryland",
  MA: "Massachusetts", MI: "Michigan", MN: "Minnesota", MS: "Mississippi", MO: "Missouri",
  MT: "Montana", NE: "Nebraska", NV: "Nevada", NH: "New Hampshire", NJ: "New Jersey",
  NM: "New Mexico", NY: "New York", NC: "North Carolina", ND: "North Dakota", OH: "Ohio",
  OK: "Oklahoma", OR: "Oregon", PA: "Pennsylvania", RI: "Rhode Island", SC: "South Carolina",
  SD: "South Dakota", TN: "Tennessee", TX: "Texas", UT: "Utah", VT: "Vermont",
  VA: "Virginia", WA: "Washington", WV: "West Virginia", WI: "Wisconsin", WY: "Wyoming",
  DC: "District of Columbia"
};

const GISMap = ({ selectedDisease }: GISMapProps) => {
  const [hoveredState, setHoveredState] = useState<string | null>(null);

  const { data: mapData, isLoading } = useQuery({
    queryKey: ["mapData", selectedDisease],
    queryFn: () => api.getMapData(selectedDisease),
  });

  // Process data to get total cases per state
  const stateData = useMemo(() => {
    if (!mapData) return {};
    const totals: Record<string, number> = {};

    Object.entries(mapData.state_totals).forEach(([abbr, cases]) => {
      const stateName = stateAbbrToName[abbr] || abbr;
      totals[stateName] = cases;
    });
    return totals;
  }, [mapData]);


  const colorScale = useMemo(() => {
    const values = Object.values(stateData);
    if (values.length === 0) return () => "#EEE";

    return scaleQuantile<string>()
      .domain(values)
      .range([
        "#ecfeff",
        "#cffafe",
        "#a5f3fc",
        "#67e8f9",
        "#22d3ee",
        "#06b6d4",
        "#0891b2",
        "#0e7490",
        "#155e75"
      ]);
  }, [stateData]);

  if (isLoading) {
    return <div className="p-8 text-center">Loading map data...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gradient">
        Geographical Distribution: {selectedDisease}
      </h2>
      <div className="glass-card-strong rounded-2xl p-6 flex flex-col items-center">
        <ComposableMap projection="geoAlbersUsa">
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const cur = stateData[geo.properties.name];
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={cur ? colorScale(cur) : "#EEE"}
                    stroke="#FFF"
                    strokeWidth={0.5}
                    onMouseEnter={() => setHoveredState(`${geo.properties.name}: ${cur || 0} cases`)}
                    onMouseLeave={() => setHoveredState(null)}
                    style={{
                      default: { outline: "none" },
                      hover: { fill: "#0ea5e9", outline: "none", cursor: "pointer" },
                      pressed: { outline: "none" },
                    }}
                  />
                );
              })
            }
          </Geographies>
        </ComposableMap>
        {hoveredState && (
          <div className="mt-4 px-4 py-2 bg-black/80 text-white rounded-full text-sm">
            {hoveredState}
          </div>
        )}
        <div className="full-w text-center text-sm text-muted-foreground mt-4">
          Total Historical Cases Density
        </div>
      </div>
    </div>
  );
};

export default GISMap;
