import { DragDataType } from "../context/GripsContext";
export interface UseDropPropTypes {
    dropID: string;
    dropHandler: (props: DragDataType) => void;
}
export default function useDrop({ dropID, dropHandler }: UseDropPropTypes): {
    isDraggedOver: boolean;
    dragData: DragDataType;
};
