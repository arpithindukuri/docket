import { OverlayScrollbarsComponent } from 'overlayscrollbars-react';
import {
  ChatDefault,
  ScheduleDefault,
  TodoDefault,
} from 'src/components/modules/defaults/ModuleDefaults';
import GridLayout from '../GridLayout';
import TodoModule from '../components/modules/todo/TodoModule';
import Module from '../components/modules/Module';
import ScheduleModule from '../components/modules/schedule/ScheduleModule';
import ChatModule from '../components/modules/chat/ChatModule';

export default function Dashboard() {
  return (
    <OverlayScrollbarsComponent
      // style={{ height: '100%', width: '100%' }}
      style={{ flexGrow: 1 }}
      options={{ scrollbars: { autoHide: 'move' } }}
    >
      <GridLayout>
        <div key="chat" data-grid={ChatDefault}>
          <ChatModule />
        </div>
        <div key="schedule" data-grid={ScheduleDefault}>
          <ScheduleModule />
        </div>
        <div key="todo" data-grid={TodoDefault}>
          <TodoModule />
        </div>
        <div key="board" data-grid={{ i: 'board', x: 0, y: 8, w: 8, h: 5 }}>
          <Module title="module" />
        </div>
        <div key="module" data-grid={{ i: 'module', x: 8, y: 8, w: 3, h: 5 }}>
          <Module title="module" />
        </div>
      </GridLayout>
    </OverlayScrollbarsComponent>
  );
}
