import type { Entity } from "@3dverse/livelink";
import { useEffect, useState } from "react";
import { QuadLayout } from "../components/QuadLayout";
import { useSelection } from "../contexts/SelectionContext";

export function ProductionCellWidget({ entity }: { entity: Entity }) {
    const { selectedElement, setSelectedElement, debug } = useSelection();

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
        <div className="pointer-events-auto">
            <QuadLayout
                entity={entity}
                face="bottom"
                center={
                    displayInfo ? (
                        <div className="cursor-pointer h-full border-4 border-[#524DC9] border-t-[#524DC9]/40 border-r-[#524DC9]/40 border-dashed" />
                    ) : (
                        <div
                            className="cursor-pointer w-full h-full hover:border-blue-700 hover:border-20"
                            onClick={() => setSelectedElement("Cell")}
                        />
                    )
                }
            />

            {displayInfo && (
                <QuadLayout
                    entity={entity}
                    face="front"
                    debug={debug}
                    center={<ProductionCellHeader entity={entity} />}
                />
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
