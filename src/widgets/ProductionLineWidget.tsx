import type { Entity, Vec3 } from "@3dverse/livelink";
import { DOM3DElement, ViewportContext } from "@3dverse/livelink-react";
import { useContext, useEffect, useState } from "react";
import { QuadLayout, type Point, type QuadPoint } from "../components/QuadLayout";
import { useBoundingBoxQuads } from "../hooks/useBoundingBoxQuads";
import { useSelection } from "../contexts/SelectionContext";

type QuadData = {
    quad: QuadPoint;
    dimensions: { width: number; height: number };
};

export function ProductionLineWidget({ entity }: { entity: Entity }) {
    const { viewport } = useContext(ViewportContext);
    const { selectedElement, setSelectedElement } = useSelection();

    const { bottom, back } = useBoundingBoxQuads(entity);
    const [bottomQuad, setBottomQuad] = useState<QuadData | null>(null);
    const [backQuad, setBackQuad] = useState<QuadData | null>(null);

    const [refreshToken, setRefreshToken] = useState<number>(0);
    const scale = 100;

    useEffect(() => {
        if (!viewport || !viewport.camera_projection || !bottom || !back) return;

        const projectedBottom = bottom.map((p: Vec3) => {
            const [x, y] = viewport.projectWorldToScreen({
                world_position: p,
            });
            return { x, y } as Point;
        }) as QuadPoint;

        setBottomQuad({
            quad: projectedBottom,
            dimensions: {
                width: (bottom[1][0] - bottom[0][0]) * scale,
                height: (bottom[3][2] - bottom[0][2]) * scale,
            },
        });

        const projectedBack = back.map((p: Vec3) => {
            const [x, y] = viewport.projectWorldToScreen({
                world_position: p,
            });
            return { x, y } as Point;
        }) as QuadPoint;

        setBackQuad({
            quad: projectedBack,
            dimensions: {
                width: (back[1][0] - back[0][0]) * scale,
                height: (back[0][1] - back[3][1]) * scale,
            },
        });
    }, [viewport, bottom, back, refreshToken]);

    const [displayInfo, setDisplayInfo] = useState(false);
    useEffect(() => {
        setDisplayInfo(
            selectedElement === "Line" &&
                entity.name === "line:l1" &&
                entity.parent?.name === "area:a6",
        );
    }, [selectedElement, entity]);

    return (
        <div>
            <DOM3DElement
                worldPosition={[0, 0, 0]}
                onProjectionChange={() => {
                    setRefreshToken((t) => t + 1);
                }}
            >
                <span />
            </DOM3DElement>

            {(bottomQuad || backQuad) && (
                <div className="pointer-events-auto">
                    {bottomQuad && (
                        <QuadLayout
                            //onMouseEnter={() => setDisplayInfo(true)}
                            //onMouseLeave={() => setDisplayInfo(false)}
                            quad={bottomQuad.quad}
                            baseW={bottomQuad.dimensions.width}
                            baseH={bottomQuad.dimensions.height}
                            center={
                                displayInfo ? (
                                    <div className="cursor-pointer h-full border-10 border-[#524DC9]" />
                                ) : (
                                    <div
                                        className="cursor-pointer w-full h-full hover:border-orange-700 hover:border-20"
                                        onClick={() => setSelectedElement("Line")}
                                    />
                                )
                            }
                            bottom={displayInfo && <ProductionAreaInfoBar />}
                        />
                    )}

                    {backQuad && (
                        <QuadLayout
                            quad={backQuad.quad}
                            baseW={backQuad.dimensions.width}
                            baseH={backQuad.dimensions.height}
                            center={displayInfo && <ProductionAreaHeader entity={entity} />}
                        />
                    )}
                </div>
            )}
        </div>
    );
}

function ProductionAreaHeader({ entity }: { entity: Entity }) {
    return (
        <div className="w-full h-full flex gap-8 text-[#524DC9] items-end">
            <div className="cursor-pointer uppercase tracking-wide shadow-lg px-4 py-6 text-6xl backdrop-blur-lg">
                Production Line <b>{entity.name}</b>
            </div>
        </div>
    );
}

function ProductionAreaInfoBar() {
    return (
        <div className="w-full flex gap-8 text-[#524DC9] items-center">
            <div className="hover:bg-[#4239A6] cursor-pointer bg-[#524DC9] uppercase tracking-wide text-white rounded-b-md px-6 py-4 shadow-lg">
                OF <b>123458</b>
            </div>
            <span className="text-shadow-black/20 text-shadow-xs">13:56</span>
            <span className="text-shadow-black/20 text-shadow-xs">
                <b>81</b>/152 units
            </span>
            <span className="text-shadow-black/20 text-shadow-xs">No incidents</span>
        </div>
    );
}
