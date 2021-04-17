import { Dispatch, SetStateAction } from "react";
export declare type DragDataType = {
    dragSource: string;
    height?: number;
    width?: number;
    payload?: {
        [key: string]: any;
    };
};
export declare type DropHandlersType = {
    [dropID: string]: (props: DragDataType) => void;
};
export declare type DropDataType = {
    dropHandlers: DropHandlersType;
};
export declare type GripsContextValueType = {
    hoverID: string | null | undefined;
    setHoverID: Dispatch<SetStateAction<string | null | undefined>>;
    dragData: DragDataType;
    setDragData: Dispatch<SetStateAction<DragDataType>>;
    dropData: DropDataType;
    setDropData: Dispatch<SetStateAction<DropDataType>>;
};
export declare const defaultValue: GripsContextValueType;
declare const GripsContext: import("react").Context<GripsContextValueType>;
export default GripsContext;
