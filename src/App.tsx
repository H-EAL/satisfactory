//------------------------------------------------------------------------------
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import {
    CameraController as CC,
    CameraControllerPresets,
    Entity,
    type Quat,
    type Vec3,
} from "@3dverse/livelink";
import {
    Livelink,
    Canvas,
    Viewport,
    CameraController,
    useCameraEntity,
    LivelinkContext,
    DOM3DOverlay,
    useEntities,
} from "@3dverse/livelink-react";
import { LoadingOverlay } from "@3dverse/livelink-react-ui";
import { Factory } from "./Factory";

//------------------------------------------------------------------------------
import "./App.css";
import { SelectionProvider, useSelection } from "./contexts/SelectionContext";

//------------------------------------------------------------------------------
const scene_id = "4c29980d-87e7-424a-97af-945fcb15def5";
const token = "public_OJTstp3bLFmUw0OS";

//------------------------------------------------------------------------------
export default function App() {
    return (
        <Livelink sceneId={scene_id} token={token} LoadingPanel={LoadingOverlay}>
            <SelectionProvider>
                <AppLayout />
            </SelectionProvider>
        </Livelink>
    );
}

//------------------------------------------------------------------------------
function AppLayout() {
    const { cameraEntity } = useCameraEntity();
    const { isConnecting } = useContext(LivelinkContext);
    const cameraControllerRef = useRef<CC | null>(null);

    const moveCamera = useCallback((entity: Entity) => {
        const labelComponent = entity.label;
        if (!labelComponent) {
            console.warn(`Entity ${entity.debug_name?.value} is not a label`);
            return;
        }

        const cameraController = cameraControllerRef.current;
        if (!cameraController) {
            console.warn("CameraController is not initialized");
            return;
        }

        // Extract camera pov from label component
        const position = labelComponent.camera.slice(0, 3) as Vec3;
        const orientation = labelComponent.camera.slice(3, 7) as Quat;

        const distance = cameraController.getTargetDistance();
        const forward = applyQuaternionToVector3(neutralForward, orientation);
        const scaledForward = forward.map((v) => v * distance) as Vec3;
        const target = addVec3(position, scaledForward);

        // Move the camera to the position and look at the target
        cameraController.setLookAt(...position, ...target, true);
    }, []);

    const showMinimap = false;

    return (
        <>
            <Canvas className="h-dvh">
                <Viewport cameraEntity={cameraEntity} className="w-full h-full">
                    {!isConnecting && (
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-green-800 text-sm text-white rounded-full py-1 px-3 pointer-events-none animate-[fade-out_.5s_2s_forwards]">
                            Connected.
                        </div>
                    )}
                    <CameraController
                        ref={cameraControllerRef}
                        preset={CameraControllerPresets.fly}
                    />

                    <DOM3DOverlay>
                        <Factory />
                    </DOM3DOverlay>
                </Viewport>
                <Labels moveCamera={moveCamera} />
                {showMinimap && <Minimap />}
            </Canvas>
        </>
    );
}

//------------------------------------------------------------------------------
function Minimap() {
    const { cameraEntity } = useCameraEntity({
        position: [0, 65, 0],
        eulerOrientation: [-90, 0, 0],
    });

    const [pickedEntity, setPickedEntity] = useState<{ entity: Entity } | null>(null);

    useEffect(() => {
        if (pickedEntity) {
            console.log(
                "Picked entity:",
                pickedEntity.entity.name,
                pickedEntity.entity.parent?.name,
                pickedEntity.entity.parent?.parent?.name,
                pickedEntity.entity.parent?.parent?.parent?.name,
            );
        }
    }, [pickedEntity]);

    return (
        <div className="md:hidden">
            <Canvas className="absolute right-3 bottom-3 w-64 h-64 border-4 border-[#524DC9] rounded-lg">
                <Viewport
                    cameraEntity={cameraEntity}
                    className="w-full h-full"
                    setPickedEntity={setPickedEntity}
                ></Viewport>
            </Canvas>
        </div>
    );
}

//------------------------------------------------------------------------------
function Labels({ moveCamera }: { moveCamera: (entity: Entity) => void }) {
    const { entities } = useEntities({ mandatory_components: ["label"] }, ["label"]);

    const { selectedElement, setSelectedElement, debug, setDebug } = useSelection();
    const breadcrumb = useMemo(() => {
        const current: string[] = [];
        switch (selectedElement) {
            case "Machine":
                current.push("machine");
            // eslint-disable-next-line no-fallthrough
            case "Cell":
                current.push("cell");
            // eslint-disable-next-line no-fallthrough
            case "Line":
                current.push("line");
            // eslint-disable-next-line no-fallthrough
            case "Area":
                current.push("area");
            // eslint-disable-next-line no-fallthrough
            case "Factory":
                current.push("factory");
        }
        return current.reverse();
    }, [selectedElement]);

    useEffect(() => {
        if (entities.length === 0) return;
        moveCamera(entities.find((e) => e.name === selectedElement) ?? entities[0]);
    }, [selectedElement, entities, moveCamera]);

    const v = {
        Factory: 0,
        Area: 1,
        Line: 2,
        Cell: 3,
        Machine: 4,
    };

    return (
        <>
            <div className="absolute left-0 top-0 flex gap-4 p-2">
                <input
                    type="checkbox"
                    id="debug"
                    className="peer hidden"
                    checked={debug}
                    onChange={(e) => setDebug(e.target.checked)}
                />
                <label
                    htmlFor="debug"
                    className={`px-3 py-1 rounded-lg cursor-pointer text-sm ${
                        debug ? "bg-gray-600 text-white" : "bg-gray-300"
                    }`}
                >
                    Debug
                </label>
                {entities
                    .sort((a, b) => v[a.name as keyof typeof v] - v[b.name as keyof typeof v])
                    .map((entity) => (
                        <button
                            className="bg-yellow-300 p-2 rounded-lg cursor-pointer"
                            key={entity.euid.value}
                            onClick={(e) => {
                                e.stopPropagation();
                                setSelectedElement(entity.name);
                            }}
                        >
                            {entity.name}
                        </button>
                    ))}
                <ul className="flex flex-row gap-2 p-2">
                    {breadcrumb.map((crumb, index) => (
                        <li key={index}>
                            {crumb} {index < breadcrumb.length - 1 ? " > " : ""}
                        </li>
                    ))}
                </ul>
            </div>
        </>
    );
}

//------------------------------------------------------------------------------
const neutralForward = [0, 0, -1] as Vec3;

//------------------------------------------------------------------------------
// Helper functions to perform vector and quaternion math without external libraries
function applyQuaternionToVector3(v: Vec3, q: Quat): Vec3 {
    // Quaternion rotation: v' = q * v * q^-1
    const [x, y, z] = v;
    const [qx, qy, qz, qw] = q;

    // Calculate quat * vector
    const ix = qw * x + qy * z - qz * y;
    const iy = qw * y + qz * x - qx * z;
    const iz = qw * z + qx * y - qy * x;
    const iw = -qx * x - qy * y - qz * z;

    // Calculate result * inverse quat
    return [
        ix * qw + iw * -qx + iy * -qz - iz * -qy,
        iy * qw + iw * -qy + iz * -qx - ix * -qz,
        iz * qw + iw * -qz + ix * -qy - iy * -qx,
    ];
}

//------------------------------------------------------------------------------
function addVec3(a: Vec3, b: Vec3): Vec3 {
    return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
}
