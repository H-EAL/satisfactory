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

export function ProductionCellWidget({ entity }: { entity: Entity }) {
    const { viewport } = useContext(ViewportContext);
    const { selectedElement, setSelectedElement } = useSelection();

    const { bottom, front: left } = useBoundingBoxQuads(entity);
    const [bottomQuad, setBottomQuad] = useState<QuadData | null>(null);
    const [backQuad, setBackQuad] = useState<QuadData | null>(null);

    const [refreshToken, setRefreshToken] = useState<number>(0);
    const scale = 100;

    useEffect(() => {
        if (!viewport || !viewport.camera_projection || !bottom || !left) return;

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

        const projectedLeft = left.map((p: Vec3) => {
            const [x, y] = viewport.projectWorldToScreen({
                world_position: p,
            });
            return { x, y } as Point;
        }) as QuadPoint;

        setBackQuad({
            quad: projectedLeft,
            dimensions: {
                width: Math.abs(left[0][0] - left[1][0]) * scale,
                height: Math.abs(left[0][1] - left[3][1]) * scale,
            },
        });
    }, [viewport, bottom, left, refreshToken]);

    const [displayInfo, setDisplayInfo] = useState(false);
    useEffect(() => {
        setDisplayInfo(
            selectedElement === "Cell" &&
                entity.name === "cell:c2" &&
                entity.parent?.name === "line:l1" &&
                entity.parent?.parent?.name === "area:a6",
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
                                        className="cursor-pointer w-full h-full hover:border-blue-700 hover:border-20"
                                        onClick={() => setSelectedElement("Cell")}
                                    />
                                )
                            }
                        />
                    )}

                    {backQuad && (
                        <QuadLayout
                            quad={backQuad.quad}
                            baseW={backQuad.dimensions.width}
                            baseH={backQuad.dimensions.height}
                            center={displayInfo && <ProductionCellHeader entity={entity} />}
                        />
                    )}
                </div>
            )}
        </div>
    );
}

function ProductionCellHeader({ entity }: { entity: Entity }) {
    return (
        <div className="w-full h-full flex flex-col justify-end">
            <div className="w-full border-4 border-[#524DC9] border-b-0 text-center bg-[#524DC9]/50 text-white rounded-t-xl cursor-pointer uppercase tracking-wide shadow-lg px-4 py-1 text-xl backdrop-blur-lg">
                Production Cell <b>{entity.name}</b>
            </div>
            <div className="border-4 border-[#524DC9] border-t-0 backdrop-blur-lg w-full text-sm p-1">
                <b>42</b>/93 items produced - <b>0</b> incidents
            </div>
        </div>
    );
}
