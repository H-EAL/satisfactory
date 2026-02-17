import { Entity } from "@3dverse/livelink";

import { useEntities } from "@3dverse/livelink-react";

import { FactoryWidget } from "./widgets/FactoryWidget";
import { ProductionAreaWidget } from "./widgets/ProductionAreaWidget";
import { ProductionLineWidget } from "./widgets/ProductionLineWidget";
import { ProductionCellWidget } from "./widgets/ProductionCellWidget";
import { MachineWidget } from "./widgets/MachineWidget";

//------------------------------------------------------------------------------
function sortEntities({ entities }: { entities: Entity[] }) {
    const factories = [];
    const areas = [];
    const lines = [];
    const cells = [];
    const machines = [];

    for (const e of entities) {
        const name = e.name.toLowerCase();
        const parts = name.split(":");
        if (parts.length != 2) continue;
        const [type] = parts;

        switch (type) {
            case "factory":
                factories.push(e);
                break;
            case "area":
                areas.push(e);
                break;
            case "line":
                lines.push(e);
                break;
            case "cell":
                cells.push(e);
                break;
            case "machine":
                machines.push(e);
                break;
        }
    }

    return { factories, areas, lines, cells, machines };
}

//------------------------------------------------------------------------------
export function FactoryBuilder() {
    const { entities } = useEntities({ mandatory_components: ["scene_ref"] });

    const { factories, areas, lines, cells, machines } = sortEntities({ entities });

    return (
        <>
            {factories.map((factory, i) => (
                <FactoryWidget key={factory.euid.value + i} entity={factory} />
            ))}
            {areas.map((area, i) => (
                <ProductionAreaWidget key={area.euid.value + i} entity={area} />
            ))}
            {lines.map((line, i) => (
                <ProductionLineWidget key={line.euid.value + i} entity={line} />
            ))}
            {cells.map((cell, i) => (
                <ProductionCellWidget key={cell.euid.value + i} entity={cell} />
            ))}
            {machines.map((machine, i) => (
                <MachineWidget key={machine.euid.value + i} entity={machine} />
            ))}
        </>
    );
}
/*
//------------------------------------------------------------------------------
function Factory({ entity }: { entity: Entity }) {
    const { entities } = useEntities({ mandatory_components: ["scene_ref"] });

    const [areas, setAreas] = useState<Entity[]>([]);

    useEffect(() => {
        setAreas(
            entities
                .filter((e) => e.name.toLowerCase().startsWith("area:"))
                .sort((a, b) => a.name.localeCompare(b.name)),
        );
    }, [entities]);

    return (
        <>
            <FactoryWidget entity={entity} />

            {areas.map((area) => (
                <ProductionArea key={area.euid.value} entity={area} />
            ))}
        </>
    );
}

//------------------------------------------------------------------------------
function ProductionArea({ entity }: { entity: Entity }) {
    const [lines, setLines] = useState<Entity[]>([]);

    useEffect(() => {
        function findLines() {
            entity.getChildren().then((candidates) => {
                const lines = candidates.filter((e) => e.name.toLowerCase().startsWith("line:"));
                setLines(lines);
            });
        }
        findLines();
    }, [entity]);

    return (
        <>
            <ProductionAreaWidget entity={entity} />

            {lines.map((line) => (
                <ProductionLine key={line.euid.value} entity={line} />
            ))}
        </>
    );
}

//------------------------------------------------------------------------------
function ProductionLine({ entity }: { entity: Entity }) {
    const [cells, setCells] = useState<Entity[]>([]);

    useEffect(() => {
        function findCells() {
            entity.getChildren().then((candidates) => {
                const cells = candidates.filter((e) => e.name.toLowerCase().startsWith("cell:"));
                setCells(cells);
            });
        }
        findCells();
    }, [entity]);

    return (
        <>
            <ProductionLineWidget entity={entity} />

            {cells.map((cell) => (
                <ProductionCell key={cell.euid.value} entity={cell} />
            ))}
        </>
    );
}
//------------------------------------------------------------------------------
function ProductionCell({ entity }: { entity: Entity }) {
    const [machines, setMachines] = useState<Entity[]>([]);

    useEffect(() => {
        function findMachines() {
            entity.getChildren().then((candidates) => {
                const machines = candidates.filter((e) =>
                    e.name.toLowerCase().startsWith("machine:"),
                );
                setMachines(machines);
            });
        }
        findMachines();
    }, [entity]);

    return (
        <>
            <ProductionCellWidget entity={entity} />

            {machines.map((machine) => (
                <MachineWidget key={machine.euid.value} entity={machine} />
            ))}
        </>
    );
}
*/
