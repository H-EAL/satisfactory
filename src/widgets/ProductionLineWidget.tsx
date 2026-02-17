import type { Entity } from "@3dverse/livelink";
import { QuadLayout } from "../components/QuadLayout";
import { useSelection } from "../contexts/SelectionContext";

export function ProductionLineWidget({
    entity,
    enableHover = false,
}: {
    entity: Entity;
    enableHover?: boolean;
}) {
    const { selectedElement, setSelectedElement, debug } = useSelection();

    const displayInfo =
        selectedElement === "line" &&
        entity.name === "line:l1" &&
        entity.parent?.name === "area:a6";

    if (!enableHover && !displayInfo) return null;

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
                            className="cursor-pointer w-full h-full hover:border-orange-700 hover:border-20"
                            onClick={() => setSelectedElement("line")}
                        />
                    )
                }
                bottom={displayInfo && <ProductionLineInfoBar />}
            />

            {displayInfo && (
                <QuadLayout
                    entity={entity}
                    face="back"
                    invert
                    debug={debug}
                    center={displayInfo && <ProductionLineHeader entity={entity} />}
                />
            )}
        </div>
    );
}

function ProductionLineHeader({ entity }: { entity: Entity }) {
    return (
        <div className="w-full h-full flex gap-8 text-[#524DC9] items-end">
            <div className="cursor-pointer uppercase tracking-wide shadow-lg px-4 py-6 text-6xl backdrop-blur-lg text-shadow-black text-shadow-xs rounded-t-4xl bg-black/20 border-4 border-b-0">
                Production Line <b>{entity.name}</b>
            </div>
        </div>
    );
}

function ProductionLineInfoBar() {
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
