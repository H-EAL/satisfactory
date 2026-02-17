import type { HTMLAttributes } from "react";

export type Point = { x: number; y: number };
export type QuadPoint = [Point, Point, Point, Point];

export function QuadLayout({
    quad,
    baseW,
    baseH,
    outskirt = 100,
    debug,
    center,
    top,
    right,
    bottom,
    left,
    ...divProps
}: {
    quad: QuadPoint | null;
    baseW: number;
    baseH: number;
    outskirt?: number;
    debug?: boolean;
    center?: React.ReactNode;
    top?: React.ReactNode;
    right?: React.ReactNode;
    bottom?: React.ReactNode;
    left?: React.ReactNode;
} & HTMLAttributes<HTMLDivElement>) {
    if (!quad) return null;

    if (!(center || top || right || bottom || left)) return null;

    return (
        <div
            className="absolute left-0 top-0 origin-top-left w-full h-full pointer-events-auto text-4xl"
            style={{
                width: baseW,
                height: baseH,
                transform: quadToMatrix3d(quad, baseW, baseH),
            }}
            {...divProps}
        >
            {(center || debug) && (
                <div className="absolute left-0 top-0 w-full h-full">
                    {debug && <DebugQuadrant quadrant="center" />}
                    {center}
                </div>
            )}

            {(left || debug) && (
                <div
                    className="absolute"
                    style={{ left: -outskirt, top: 0, width: outskirt, height: baseH }}
                >
                    {debug && <DebugQuadrant quadrant="left" />}
                    {left}
                </div>
            )}

            {(top || debug) && (
                <div
                    className="absolute"
                    style={{ left: 0, top: -outskirt, width: baseW, height: outskirt }}
                >
                    {debug && <DebugQuadrant quadrant="top" />}
                    {top}
                </div>
            )}

            {(right || debug) && (
                <div
                    className="absolute"
                    style={{ left: baseW, top: 0, width: outskirt, height: baseH }}
                >
                    {debug && <DebugQuadrant quadrant="right" />}
                    {right}
                </div>
            )}

            {(bottom || debug) && (
                <div
                    className="absolute"
                    style={{ left: 0, top: baseH, width: baseW, height: outskirt }}
                >
                    {debug && <DebugQuadrant quadrant="bottom" />}
                    {bottom}
                </div>
            )}
        </div>
    );
}

function DebugQuadrant({ quadrant }: { quadrant: "center" | "top" | "right" | "bottom" | "left" }) {
    const color = {
        center: "bg-red-500/50",
        top: "bg-blue-500/50",
        right: "bg-green-500/50",
        bottom: "bg-pink-500/50",
        left: "bg-yellow-500/50",
    } as Record<string, string>;

    return (
        <div
            className={`absolute top-0 left-0 w-full h-full ${color[quadrant]} text-xl text-center content-center`}
        >
            {quadrant.toUpperCase()}
        </div>
    );
}

/**
 * Maps a rectangle [0..w, 0..h] to an arbitrary screen quad (tl,tr,br,bl)
 * and returns a CSS matrix3d(...) string.
 */
function quadToMatrix3d(quad: [Point, Point, Point, Point], w: number, h: number): string {
    const src: [Point, Point, Point, Point] = [
        { x: 0, y: 0 },
        { x: w, y: 0 },
        { x: w, y: h },
        { x: 0, y: h },
    ];

    const A: number[][] = [];
    const b: number[] = [];

    for (let i = 0; i < 4; i++) {
        const { x, y } = src[i];
        const { x: X, y: Y } = quad[i];

        // a*x + b*y + c - g*x*X - h*y*X = X
        A.push([x, y, 1, 0, 0, 0, -x * X, -y * X]);
        b.push(X);

        // d*x + e*y + f - g*x*Y - h*y*Y = Y
        A.push([0, 0, 0, x, y, 1, -x * Y, -y * Y]);
        b.push(Y);
    }

    const [a, b2, c, d, e, f, g, h2] = solveLinearSystem(A, b);

    // CSS matrix3d is column-major:
    // x' = (a*x + b*y + c) / (g*x + h*y + 1)
    // y' = (d*x + e*y + f) / (g*x + h*y + 1)
    return `matrix3d(${[a, d, 0, g, b2, e, 0, h2, 0, 0, 1, 0, c, f, 0, 1].join(",")})`;
}

function solveLinearSystem(A: number[][], b: number[]): number[] {
    const n = b.length;
    const M = A.map((row, i) => [...row, b[i]]);

    for (let col = 0; col < n; col++) {
        // Pivot
        let pivot = col;
        for (let r = col + 1; r < n; r++) {
            if (Math.abs(M[r][col]) > Math.abs(M[pivot][col])) pivot = r;
        }
        if (Math.abs(M[pivot][col]) < 1e-12) {
            // new Error("Singular matrix: quad is degenerate");
            return [];
        }
        [M[col], M[pivot]] = [M[pivot], M[col]];

        // Normalize row
        const div = M[col][col];
        for (let c = col; c <= n; c++) M[col][c] /= div;

        // Eliminate
        for (let r = 0; r < n; r++) {
            if (r === col) continue;
            const factor = M[r][col];
            for (let c = col; c <= n; c++) M[r][c] -= factor * M[col][c];
        }
    }

    return M.map((row) => row[n]);
}
