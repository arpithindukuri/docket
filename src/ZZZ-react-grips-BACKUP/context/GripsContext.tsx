/* global dragDataTypeDeclaration */
import { createContext, Dispatch, SetStateAction } from 'react';
import { dragStateTypes } from '../../react-grips/hooks/useDrag';

// export interface DragDataType {
//   dragSource: dragDataTypeDeclarations['dragSource'];
//   height?: number;
//   width?: number;
//   payload?: dragDataTypeDeclarations['payload'];
// }

export type DragDataType = dragDataTypeDeclaration;

export interface DropHandlersType {
  [dropID: string]: (arg0: dragStateTypes) => void;
}

export interface DropDataType {
  dropHandlers: DropHandlersType;
}

export interface GripsContextValueType {
  dropID: string | null | undefined;
  setDropID: Dispatch<SetStateAction<string | null | undefined>>;
  dragData: DragDataType;
  setDragData: Dispatch<SetStateAction<DragDataType>>;
  dropData: DropDataType;
  setDropData: Dispatch<SetStateAction<DropDataType>>;
}

export const defaultValue: GripsContextValueType = {
  dropID: '',
  setDropID: () => {},
  dragData: {} as DragDataType,
  setDragData: () => {},
  dropData: { dropHandlers: {} },
  setDropData: () => {},
};

const GripsContext = createContext<GripsContextValueType>(defaultValue);

export default GripsContext;
