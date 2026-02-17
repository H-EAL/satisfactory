import { createContext, useContext, useMemo, useState, type PropsWithChildren } from "react";

type SelectionContextValue = {
    debug: boolean;
    selectedElement: string;
    setSelectedElement: (value: string) => void;
    setDebug: (value: boolean) => void;
};
const SelectionContext = createContext<SelectionContextValue | null>(null);

export function SelectionProvider({ children }: PropsWithChildren) {
    const [selectedElement, setSelectedElement] = useState("");
    const [debug, setDebug] = useState(false);

    const value = useMemo(
        () => ({ selectedElement, setSelectedElement, debug, setDebug }),
        [selectedElement, debug],
    );

    return <SelectionContext.Provider value={value}>{children}</SelectionContext.Provider>;
}

export function useSelection() {
    const ctx = useContext(SelectionContext);
    if (!ctx) throw new Error("useSelection must be used inside <SelectionProvider>");
    return ctx;
}
