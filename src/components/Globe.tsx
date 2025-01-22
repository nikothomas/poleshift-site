import React from "react";
import { geoOrthographic, geoPath } from "d3-geo";
import { timer, type Timer } from "d3-timer";
import { feature } from "topojson-client";

// 1) Directly import your local TopoJSON file.
//    Make sure your bundler/TypeScript config allows importing JSON files.
import topoData from "../assets/globe-geo.json";

interface GlobeProps {}
interface GlobeState {
    rotation: [number, number, number];
    geoData: any; // Holds the converted GeoJSON
}

class Globe extends React.Component<GlobeProps, GlobeState> {
    private rotationTimer: Timer | null = null;

    constructor(props: GlobeProps) {
        super(props);

        // 2) Convert TopoJSON to GeoJSON right in the constructor (or anywhere convenient).
        //    Make sure "countries" matches the name in your TopoJSON’s "objects" key.
        // @ts-ignore
        const converted = feature(topoData, topoData.objects.countries);

        this.state = {
            rotation: [0, 0, 0],
            geoData: converted,
        };
    }

    componentDidMount() {
        // 3) Start rotation (no fetch needed anymore)
        this.rotationTimer = timer(() => {
            this.setState(({ rotation: [lambda, phi, gamma] }) => ({
                rotation: [lambda + 0.015, phi + 0.015, gamma],
            }));
        });
    }

    componentWillUnmount() {
        if (this.rotationTimer) {
            this.rotationTimer.stop();
        }
    }

    render() {
        const { rotation, geoData } = this.state;

        // If you want a loading check:
        if (!geoData) {
            return <div>Loading...</div>;
        }

        // 4) Setup the projection
        const projection = geoOrthographic()
            .rotate(rotation)
            .translate([400, 400]) // center in an 800×800 container
            .clipAngle(180);

        const pathGenerator = geoPath(projection);

        return (
            <div style={{ width: 800, height: 800 }}>
                <svg width={800} height={800}>
                    <circle
                        cx={400}
                        cy={400}
                        r={projection.scale()}
                        fill="rgba(200, 200, 200, 0.05)"
                        stroke="rgba(80, 80, 80, 0.5)"
                    />
                    <g>
                        {geoData.features.map((featureObj: any, i: number) => (
                            <path
                                key={i}
                                d={pathGenerator(featureObj) || ""}
                                style={{
                                    fill: "rgba(200, 200, 200, 0.3)",
                                    stroke: "rgba(80, 80, 80, 0.5)",
                                    pointerEvents: "none",
                                }}
                            />
                        ))}
                    </g>
                </svg>
            </div>
        );
    }
}

export default Globe;