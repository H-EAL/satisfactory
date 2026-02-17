import type { Entity } from "@3dverse/livelink";
import { useEffect, useState } from "react";
import { QuadLayout } from "../components/QuadLayout";
import { useSelection } from "../contexts/SelectionContext";

export function MachineWidget({ entity }: { entity: Entity }) {
    const { selectedElement, setSelectedElement, debug } = useSelection();

    const [displayInfo, setDisplayInfo] = useState(false);
    useEffect(() => {
        setDisplayInfo(
            selectedElement === "Machine" &&
                entity.name === "machine:m1" &&
                entity.parent?.name === "cell:c2" &&
                entity.parent?.parent?.name === "line:l1" &&
                entity.parent?.parent?.parent?.name === "area:a6",
        );
    }, [selectedElement, entity]);

    return (
        <div className="pointer-events-auto">
            <QuadLayout
                entity={entity}
                face="bottom"
                center={
                    displayInfo ? (
                        <div className="cursor-pointer h-full border-b-10 border-l-10 border-[#524DC9]" />
                    ) : (
                        <div
                            className="cursor-pointer h-full hover:border-b-2 hover:border-l    -2 border-b-fuchsia-600"
                            onClick={() => setSelectedElement("Machine")}
                        />
                    )
                }
            />
            {displayInfo && (
                <QuadLayout
                    entity={entity}
                    face="right"
                    invert
                    debug={debug}
                    right={<ProductionAreaHeader entity={entity} />}
                />
            )}
        </div>
    );
}

function ProductionAreaHeader({ entity }: { entity: Entity }) {
    return (
        <div className="h-full w-fit flex flex-col outline-2 text-[#524DC9] justify-start backdrop-blur-lg">
            <div className="cursor-pointer uppercase tracking-wide shadow-lg px-4 py-1 text-xl ">
                Machine <b>{entity.name}</b>
            </div>
            <div className="grow text-xs bg-amber-50/50 m-2 p-2 rounded-lg backdrop-blur-lg text-black border border-black/40">
                Blabla
            </div>
        </div>
    );
}
