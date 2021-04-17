import { useState } from 'react';
import GripsContext, { defaultValue } from './GripsContext';

export interface GripsProviderPropTypes {
  children: any;
}

export default function GripsProvider({ children }: GripsProviderPropTypes) {
  const [gripsDropID, setgripsDropID] = useState(defaultValue.dropID);
  const [gripsDragData, setGripsDragData] = useState(defaultValue.dragData);
  const [gripsDropData, setGripsDropData] = useState(defaultValue.dropData);

  return (
    <GripsContext.Provider
      value={{
        dropID: gripsDropID,
        setDropID: setgripsDropID,
        dragData: gripsDragData,
        setDragData: setGripsDragData,
        dropData: gripsDropData,
        setDropData: setGripsDropData,
      }}
    >
      {children}
    </GripsContext.Provider>
  );
}
