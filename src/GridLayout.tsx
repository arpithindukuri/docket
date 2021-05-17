import { PureComponent } from 'react';
import { Layout, Layouts, Responsive, WidthProvider } from 'react-grid-layout';

const ResponsiveGridLayout = WidthProvider(Responsive);

export interface propTypes {
  children?: any;
}

export function gl({ children }: propTypes) {
  return (
    <ResponsiveGridLayout
      className="layout"
      breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
      cols={{ lg: 18, md: 15, sm: 12, xs: 9, xxs: 6 }}
      rowHeight={60}
      draggableHandle=".module-handle"
      // useCSSTransforms={false}
      margin={[12, 12]}
    >
      {children}
    </ResponsiveGridLayout>
  );
}

const originalLayouts = getFromLS('layouts') || {};

/**
 * This layout demonstrates how to sync multiple responsive layouts to localstorage.
 */
export default class GridLayout extends PureComponent<
  {},
  { layouts: Layouts; currentBreakpoint: string | null }
> {
  breakpoints: { [key: string]: number } = {
    lg: 1200,
    md: 996,
    sm: 768,
    xs: 480,
    xxs: 0,
  };

  constructor(props: any) {
    super(props);

    this.state = {
      layouts: JSON.parse(JSON.stringify(originalLayouts)),
      currentBreakpoint: null,
    };
  }

  onWidthChange = (width: number) => {
    const { currentBreakpoint: initialBreakpoint } = this.state;

    if (initialBreakpoint === null) {
      // The very first time.
      // Compute the initial breakpoint.
      const { breakpoints } = this;
      const sortedBreakpoints = Object.keys(breakpoints).sort(
        (breakpoint1, breakpoint2) =>
          breakpoints[breakpoint1] - breakpoints[breakpoint2],
      );
      let breakpoint = sortedBreakpoints[0];
      for (let i = 0; i < sortedBreakpoints.length; i += 1) {
        const currentBreakpoint = sortedBreakpoints[i];
        const nextBreakpoint = sortedBreakpoints[i + 1];
        if (
          typeof nextBreakpoint === 'undefined' ||
          (breakpoints[currentBreakpoint] <= width &&
            width <= breakpoints[nextBreakpoint])
        ) {
          breakpoint = currentBreakpoint;
          break;
        }
      }
      this.setState({ currentBreakpoint: breakpoint });

      // Call your method.
      // this.props.updateBreakpointKey(this.initialBreakpoint);
    }
  };

  onLayoutChange(layout: Layout[], layouts: Layouts) {
    saveToLS('layouts', layouts);

    const { currentBreakpoint } = this.state;
    if (currentBreakpoint) {
      this.setState((prev) => {
        const newLayouts = prev.layouts;
        if (prev.currentBreakpoint) {
          newLayouts[prev.currentBreakpoint] = layout;
        }

        return {
          layouts: newLayouts,
          currentBreakpoint: prev.currentBreakpoint,
        };
      });
    }
    // this.setState({ layouts });
  }

  render() {
    const { layouts } = this.state;
    const { children } = this.props;

    return (
      <ResponsiveGridLayout
        useCSSTransforms={false}
        className="layout"
        breakpoints={this.breakpoints}
        cols={{ lg: 18, md: 15, sm: 12, xs: 9, xxs: 6 }}
        rowHeight={50}
        draggableHandle=".module-handle"
        margin={[24, 24]}
        layouts={layouts}
        measureBeforeMount
        onLayoutChange={(layout, changeLayouts) =>
          this.onLayoutChange(layout, changeLayouts)
        }
        onWidthChange={(w) => {
          this.onWidthChange(w);
        }}
        onBreakpointChange={(breakpoint) => {
          this.setState({ currentBreakpoint: breakpoint });
        }}
        // onDragStart={(layout, oldItem, newItem, placeholder, event) => {
        //   console.log(layout);
        //   console.log(oldItem);
        //   console.log(newItem);
        //   console.log(event);
        //   console.log(event.dataTransfer?.getData('text/plain') || '');
        // }}
        isDroppable
        // droppingItem={{ i: '0', w: 3, h: 3 }}
        onDrop={(layout, oldItem, event) => {
          console.log(layout);
          console.log(oldItem);
          console.log(event);
          // console.log(event.dataTransfer?.getData('text/plain') || '');
        }}
      >
        {children}
      </ResponsiveGridLayout>
    );
  }
}

function getFromLS(key: string) {
  let ls: { [key: string]: any } = {};
  if (global.localStorage) {
    try {
      ls = JSON.parse(global.localStorage.getItem('rgl-8') || '') || {};
    } catch (e) {}
  }
  return ls[key];
}

function saveToLS(key: string, value: any) {
  if (global.localStorage) {
    global.localStorage.setItem(
      'rgl-8',
      JSON.stringify({
        [key]: value,
      }),
    );
  }
}

export function clearLS() {
  if (global.localStorage) {
    global.localStorage.removeItem('rgl-8');
  }
}
