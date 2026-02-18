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
import { FactoryBuilder } from "./Factory";

//------------------------------------------------------------------------------
import "./App.css";
import { SelectionProvider, useSelection } from "./contexts/SelectionContext";

//------------------------------------------------------------------------------
const scene_id = "a4213021-3fee-4348-9c6d-8ebf8cd84842";
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

        //const distance = cameraController.getTargetDistance();
        const distance = cameraController.distance;
        const forward = applyQuaternionToVector3(neutralForward, orientation);
        const scaledForward = forward.map((v) => v * distance) as Vec3;
        const target = addVec3(position, scaledForward);

        // Move the camera to the position and look at the target
        cameraController.setLookAt(...position, ...target, true);
    }, []);

    const showMinimap = true;

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
                        <FactoryBuilder />
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

    const { setSelectedElement } = useSelection();

    useEffect(() => {
        if (pickedEntity) {
            const lineage = [];
            let current: Entity | null = pickedEntity.entity;
            while (current) {
                if (current.scene_ref && current.name.includes(":")) {
                    lineage.push(current.name);
                }
                current = current.parent;
            }
            const element = lineage[0].split(":")[0];
            console.log("Picked entity element:", element);
            setSelectedElement(element);
        }
    }, [pickedEntity, setSelectedElement]);

    return (
        <div className="">
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

    const { entities: anims } = useEntities({ euid: "50d4ddf0-2b24-42a7-8415-f2ee8f959a4f" });

    let anim: Entity | null = null;

    for (const a of anims) {
        a!.animation_sequence_controller!.seekOffset = Math.random();
        if (a.parent?.name === "machine:m2") {
            if (a.parent.parent?.name === "cell:c2") {
                if (a.parent.parent.parent?.name === "line:l1") {
                    if (a.parent.parent.parent.parent?.name === "area:a6") {
                        anim = a;
                        break;
                    }
                }
            }
        }
    }

    const { selectedElement, setSelectedElement, debug, setDebug } = useSelection();
    const breadcrumb = useMemo(() => {
        const current: string[] = [];
        switch (selectedElement) {
            case "machine":
                current.push("machine");
            // eslint-disable-next-line no-fallthrough
            case "cell":
                current.push("cell");
            // eslint-disable-next-line no-fallthrough
            case "line":
                current.push("line");
            // eslint-disable-next-line no-fallthrough
            case "area":
                current.push("area");
            // eslint-disable-next-line no-fallthrough
            case "factory":
                current.push("factory");
        }
        return current.reverse();
    }, [selectedElement]);

    useEffect(() => {
        if (entities.length === 0) return;
        moveCamera(entities.find((e) => e.name.toLowerCase() === selectedElement) ?? entities[0]);

        if (anim && anim.animation_sequence_controller) {
            anim.animation_sequence_controller.seekOffset = 0;
            anim.animation_sequence_controller.playState = selectedElement === "machine" ? 1 : 0;
        }

        for (const a of anims) {
            a!.animation_sequence_controller!.playState = 1;
        }
    }, [selectedElement, entities, moveCamera, anim]);

    const v = {
        Factory: 0,
        Area: 1,
        Line: 2,
        Cell: 3,
        Machine: 4,
    };

    return (
        <>
            <div className="absolute left-0 top-0 flex gap-4 p-4 bg-[#524DC9]/70 backdrop-blur-lg rounded-br-xl drop-shadow-lg border-b-2 border-r-2 border-[#524DC9]">
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
                                setSelectedElement(entity.name.toLowerCase());
                            }}
                        >
                            {entity.name}
                        </button>
                    ))}
                <ul className="flex flex-row gap-2 p-2 text-white">
                    {breadcrumb.map((crumb, index) => (
                        <li key={index}>
                            {index === breadcrumb.length - 1 ? (
                                <b>{crumb}</b>
                            ) : (
                                <a
                                    href="#"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedElement(crumb);
                                    }}
                                    className="hover:text-yellow-300 underline"
                                >
                                    {crumb}
                                </a>
                            )}
                            {index < breadcrumb.length - 1 ? " > " : ""}
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
