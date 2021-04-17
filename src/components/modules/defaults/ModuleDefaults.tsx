// export interface ModuleDefaultType {
//   i: string;
//   minW: number;
//   maxW: number;
//   minH: number;
//   maxH: number;
//   h: number;
//   w: number;
// }
export interface ModuleDefaultType {
  // A string corresponding to the component key
  i: string;

  // These are all in grid units, not pixels
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  maxW?: number;
  minH?: number;
  maxH?: number;

  // If true, equal to `isDraggable: false, isResizable: false`.
  static?: boolean;
  // If false, will not be draggable. Overrides `static`.
  isDraggable?: boolean;
  // If false, will not be resizable. Overrides `static`.
  isResizable?: boolean;
  // By default, a handle is only shown on the bottom-right (southeast) corner.
  // Note that resizing from the top or left is generally not intuitive.
  resizeHandles?: Array<'s' | 'w' | 'e' | 'n' | 'sw' | 'nw' | 'se' | 'ne'>;
  // If true and draggable, item will be moved only within grid.
  isBounded?: boolean;
}

export const TodoDefault: ModuleDefaultType = {
  i: 'dashboard-todo',
  minW: 3,
  maxW: 10,
  minH: 3,
  maxH: 15,
  x: 0,
  y: 0,
  h: 8,
  w: 4,
};

export const ScheduleDefault: ModuleDefaultType = {
  i: 'dashboard-schedule',
  minW: 3,
  maxW: 20,
  minH: 3,
  maxH: 15,
  x: 7,
  y: 0,
  h: 3,
  w: 2,
};

export const ChatDefault: ModuleDefaultType = {
  i: 'dashboard-chat',
  minW: 3,
  maxW: 20,
  minH: 3,
  maxH: 15,
  x: 11,
  y: 0,
  h: 2,
  w: 2,
};

export const DefaultIDMap: { [key: string]: ModuleDefaultType } = {
  'dashboard-todo': TodoDefault,
  'dashboard-schedule': ScheduleDefault,
  'dashboard-chat': ChatDefault,
};
