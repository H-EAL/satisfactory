import { createContext, useContext, useMemo, useState, type PropsWithChildren } from "react";

type SelectionContextValue = {
    selectedElement: string;
    setSelectedElement: (value: string) => void;
};
const SelectionContext = createContext<SelectionContextValue | null>(null);

export function SelectionProvider({ children }: PropsWithChildren) {
    const [selectedElement, setSelectedElement] = useState("");

    const value = useMemo(() => ({ selectedElement, setSelectedElement }), [selectedElement]);

    return <SelectionContext.Provider value={value}>{children}</SelectionContext.Provider>;
}

export function useSelection() {
    const ctx = useContext(SelectionContext);
    if (!ctx) throw new Error("useSelection must be used inside <SelectionProvider>");
    return ctx;
}
