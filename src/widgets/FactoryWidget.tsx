import type { Entity } from "@3dverse/livelink";
import { Gauge } from "../components/Gauge";
import { QuadLayout } from "../components/QuadLayout";
import { useSelection } from "../contexts/SelectionContext";

export function FactoryWidget({
    entity,
    enableHover = false,
}: {
    entity: Entity;
    enableHover?: boolean;
}) {
    const { selectedElement, debug } = useSelection();

    const displayInfo = selectedElement === "factory" && entity.name === "factory:f1";

    if (!enableHover && !displayInfo) return null;

    return (
        <div className="pointer-events-auto">
            <QuadLayout
                entity={entity}
                face="bottom"
                scale={10}
                /*center={
                    displayInfo ? (
                        <div className="cursor-pointer h-full outline-4 outline-[#524DC9]" />
                    ) : (
                        <div
                            className="cursor-pointer h-full hover:border-b-2 hover:border-l    -2 border-b-fuchsia-600"
                            onClick={() => setSelectedElement("Factory")}
                        />
                    )
                }*/
            />
            {displayInfo && (
                <QuadLayout
                    entity={entity}
                    face="back"
                    invert
                    scale={20}
                    debug={debug}
                    center={<FactoryHeader entity={entity} />}
                />
            )}

            {displayInfo && (
                <QuadLayout
                    entity={entity}
                    face="front"
                    scale={20}
                    debug={debug}
                    center={<FactoryGauges />}
                    bottom={<FactoryInfoPanel />}
                />
            )}
        </div>
    );
}

function FactoryHeader({ entity }: { entity: Entity }) {
    return (
        <div className="h-full w-full flex flex-col text-[#524DC9] justify-start bg-white/30 backdrop-blur-lg">
            <div className="grow w-full text-center text-5xl m-2 p-2">
                Factory <b className="text-white">{entity.name}</b>
            </div>
        </div>
    );
}

function FactoryGauges() {
    return (
        <div className="h-full bg-black/30 flex justify-between px-8 py-2 backdrop-blur-sm gap-8">
            <div className="self-center text-md">ABC</div>
            <Gauge value={93} label="ABC" size={80} />
            <div className="self-center text-md">OEE</div>
            <Gauge value={97} label="OEE" size={80} />
            <div className="self-center text-md">JKL</div>
            <Gauge value={56} label="JKL" size={80} />
        </div>
    );
}

function FactoryInfoPanel() {
    const columns = [
        {
            title: "Shift",
            rows: [
                { label: "Current", value: "A (06:00-14:00)" },
                { label: "Supervisor", value: "M. Rivera" },
                { label: "Attendance", value: "47 / 52" },
            ],
        },
        {
            title: "Throughput",
            rows: [
                { label: "Target", value: "1,280 units" },
                { label: "Actual", value: "1,143 units" },
                { label: "Variance", value: "-10.7%" },
            ],
        },
        {
            title: "Quality",
            rows: [
                { label: "First Pass Yield", value: "97.4%" },
                { label: "Scrap", value: "1.8%" },
                { label: "Rework", value: "0.8%" },
            ],
        },
        {
            title: "Downtime",
            rows: [
                { label: "Unplanned", value: "00:21:17" },
                { label: "Planned", value: "00:35:00" },
                { label: "Top Cause", value: "Conveyor Jam" },
            ],
        },
    ];

    return (
        <div className="w-full h-fit bg-white/10 text-white backdrop-blur-xs p-4">
            <div className="mb-3 text-sm font-semibold tracking-wide uppercase">
                Overall Factory Status
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                {columns.map((col) => (
                    <div
                        key={col.title}
                        className="rounded-md bg-black/20 p-3 border border-white/20"
                    >
                        <div className="mb-2 text-[11px] uppercase tracking-wider text-white/80">
                            {col.title}
                        </div>
                        <div className="space-y-1.5">
                            {col.rows.map((row) => (
                                <div key={row.label} className="flex justify-between gap-3">
                                    <span className="text-white/70">{row.label}</span>
                                    <span className="font-semibold text-right">{row.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
