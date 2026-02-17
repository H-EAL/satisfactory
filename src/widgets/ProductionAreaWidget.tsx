import type { Entity } from "@3dverse/livelink";
import { useEffect, useState } from "react";
import { QuadLayout } from "../components/QuadLayout";
import { useSelection } from "../contexts/SelectionContext";

export function ProductionAreaWidget({ entity }: { entity: Entity }) {
    const { selectedElement, setSelectedElement, debug } = useSelection();

    const [displayInfo, setDisplayInfo] = useState(false);
    useEffect(() => {
        setDisplayInfo(selectedElement === "Area" && entity.name === "area:a6");
    }, [selectedElement, entity]);

    if (!displayInfo) return null;

    return (
        <div className="pointer-events-auto">
            <QuadLayout
                entity={entity}
                face="bottom"
                center={
                    displayInfo ? (
                        <div className="cursor-pointer h-full border-10 border-[#524DC9]" />
                    ) : (
                        <div
                            className="cursor-pointer w-full h-full hover:border-green-700 hover:border-20"
                            onClick={() => setSelectedElement("Area")}
                        />
                    )
                }
                bottom={displayInfo && <ProductionAreaInfoBar />}
            />

            {displayInfo && (
                <QuadLayout
                    entity={entity}
                    face="back"
                    invert
                    debug={debug}
                    center={displayInfo && <ProductionAreaHeader entity={entity} />}
                />
            )}
        </div>
    );
}

function ProductionAreaHeader({ entity }: { entity: Entity }) {
    return (
        <div className="w-full h-full flex gap-8 text-[#524DC9] items-end">
            <div className="cursor-pointer uppercase tracking-wide shadow-lg px-4 py-6 text-6xl backdrop-blur-lg">
                Production Area <b>{entity.name}</b>
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
