import { useContext, useEffect, useState } from 'react';
import GripsContext from '../context/GripsContext';
import { dragStateTypes } from './useDrag';

export interface UseDropPropTypes {
  thisDropID: string;
  dropHandler?: (props: dragStateTypes) => void;
}

export default function useDrop({ thisDropID, dropHandler }: UseDropPropTypes) {
  const { dropID, dragData, setDropData } = useContext(GripsContext);
  const [isDraggedOver, setIsDraggedOver] = useState(false);

  useEffect(() => {
    setIsDraggedOver(() => dropID === thisDropID);
  }, [dropID, thisDropID]);

  useEffect(() => {
    if (dropHandler) {
      setDropData((prev) => ({
        ...prev,
        dropHandlers: { ...prev.dropHandlers, [thisDropID]: dropHandler },
      }));
    }
  }, [thisDropID, dropHandler]);

  return { isDraggedOver, dragData };
}
