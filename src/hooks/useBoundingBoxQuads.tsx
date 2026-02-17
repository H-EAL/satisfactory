import type { Entity, Vec3 } from "@3dverse/livelink";
import { useState, useEffect } from "react";

export type Quad = [Vec3, Vec3, Vec3, Vec3]; // tl, tr, br, bl

export function useBoundingBoxQuads(entity: Entity) {
    const [front, setFront] = useState<Quad | null>(null);
    const [back, setBack] = useState<Quad | null>(null);
    const [top, setTop] = useState<Quad | null>(null);
    const [bottom, setBottom] = useState<Quad | null>(null);
    const [left, setLeft] = useState<Quad | null>(null);
    const [right, setRight] = useState<Quad | null>(null);

    useEffect(() => {
        const min = entity.global_aabb.min;
        const max = entity.global_aabb.max;

        const leftBottomBack: Vec3 = [min[0], min[1], min[2]];
        const leftBottomFront: Vec3 = [min[0], min[1], max[2]];
        const rightBottomBack: Vec3 = [max[0], min[1], min[2]];
        const rightBottomFront: Vec3 = [max[0], min[1], max[2]];

        const leftTopBack: Vec3 = [min[0], max[1], min[2]];
        const leftTopFront: Vec3 = [min[0], max[1], max[2]];
        const rightTopBack: Vec3 = [max[0], max[1], min[2]];
        const rightTopFront: Vec3 = [max[0], max[1], max[2]];

        setFront([leftTopFront, rightTopFront, rightBottomFront, leftBottomFront]);

        setBack([rightTopBack, leftTopBack, leftBottomBack, rightBottomBack]);

        setTop([leftTopFront, rightTopFront, rightTopBack, leftTopBack]);

        setBottom([leftBottomBack, rightBottomBack, rightBottomFront, leftBottomFront]);

        setLeft([leftTopBack, leftTopFront, leftBottomFront, leftBottomBack]);

        setRight([rightTopFront, rightTopBack, rightBottomBack, rightBottomFront]);
    }, [entity]);

    return { front, back, top, bottom, left, right };
}
