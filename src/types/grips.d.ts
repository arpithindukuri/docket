declare interface dragDataTypeDeclaration {
  dragSource: '' | 'todo' | 'schedule' | 'schedule-resize';
  todoPayload: {
    todo: import('../redux/todoSlice').Todo;
  };
  schedulePayload: {
    sourceScheduleDropID: string;
    event: import('../redux/eventSlice').Event;
  };
}
