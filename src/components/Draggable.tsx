/* eslint-disable react/jsx-props-no-spreading */

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export default function Draggable({
  children,
  id,
}: {
  children: any;
  id: string;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({
    id,
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={{
        transform: CSS.Transform.toString(transform),
        transition: transition || undefined,
        marginBottom: '8px',
      }}
    >
      {children}
    </div>
  );
}
