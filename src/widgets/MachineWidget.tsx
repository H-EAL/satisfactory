import type { Entity } from "@3dverse/livelink";
import { QuadLayout } from "../components/QuadLayout";
import { useSelection } from "../contexts/SelectionContext";
import { Gauge } from "../components/Gauge";

export function MachineWidget({
    entity,
    enableHover = false,
}: {
    entity: Entity;
    enableHover?: boolean;
}) {
    const { selectedElement, setSelectedElement, debug } = useSelection();

    const displayInfo =
        selectedElement === "machine" &&
        entity.name === "machine:m2" &&
        entity.parent?.name === "cell:c2" &&
        entity.parent?.parent?.name === "line:l1" &&
        entity.parent?.parent?.parent?.name === "area:a6";

    if (!enableHover && !displayInfo) return null;

    return (
        <div className="pointer-events-auto">
            <QuadLayout
                entity={entity}
                face="bottom"
                center={
                    displayInfo ? (
                        <div className="cursor-pointer h-full border-b-2 border-l-2 border-[#524DC9] border-dashed" />
                    ) : (
                        <div
                            className="cursor-pointer h-full hover:border-b-2 hover:border-l-2 border-fuchsia-600"
                            onClick={() => setSelectedElement("machine")}
                        />
                    )
                }
            />
            {displayInfo && (
                <QuadLayout
                    entity={entity}
                    face="right"
                    invert
                    scale={300}
                    debug={debug}
                    right={<ProductionAreaInfoPanel entity={entity} />}
                />
            )}
        </div>
    );
}

function ProductionAreaInfoPanel({ entity }: { entity: Entity }) {
    return (
        <div className="h-full flex flex-col outline-4 bg-black/25 border-b-100 shadow-2xl text-[#524DC9] justify-start backdrop-blur-lg aspect-4/6">
            <div className="cursor-pointer text-white bg-[#524DC9] uppercase tracking-wide px-4 py-1 text-xl flex flex-row justify-between">
                <div>
                    Machine <b>{entity.name}</b>
                </div>
                <div>
                    <button className="bg-amber-400 rounded-xl px-3 py-1 text-xs cursor-pointer">
                        More info
                    </button>
                </div>
            </div>
            <div className="text-sm backdrop-opacity-0 backdrop-invert-0 bg-white/30 m-2 p-2 rounded-lg backdrop-blur-lg text-black border border-black/40">
                <div className="font-semibold mb-1">Machine Information</div>
                <div>Status: Active</div>
                <div>Production Rate: 100 units/min</div>
                <div className="">
                    Efficiency <Gauge value={95} />
                </div>
                <div>Power Consumption: 50 kW</div>
            </div>
        </div>
    );
}
