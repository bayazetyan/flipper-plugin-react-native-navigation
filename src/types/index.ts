import {LayoutRoot, Options} from "react-native-navigation";

export enum LayoutType {
  Component = 'Component',
  Stack = 'Stack',
  BottomTabs = 'BottomTabs',
  SideMenuRoot = 'SideMenuRoot',
  SideMenuCenter = 'SideMenuCenter',
  SideMenuLeft = 'SideMenuLeft',
  SideMenuRight = 'SideMenuRight',
  TopTabs = 'TopTabs',
  ExternalComponent = 'ExternalComponent',
  SplitView = 'SplitView',
}

export interface Column {
  id?: string;
  type?: string;
  hasPop: boolean;
  action?: string;
  context?: string;
  screen?: string;
}

export interface TimelineItem extends Column {
  data?: Data;
}

export interface Data {
  name?: string;
  options?: any;
  passProps?: any;
}
export interface LayoutNode {
  id?: string;
  data?: Data;
  type?: LayoutType;
  children?: LayoutNode[];
}

export type Stack = {
  screen?: string
  componentId?: string
}

export type Methods = {
  navigate: () => Promise<{
    type: string
    params: {
      layout: LayoutNode
    }
  }>,
  updateOptions: () => Promise<{ context: string, options: Options }>,
  updateProps: () => Promise<{ context: string, props: Record<string, any> }>,
}

export type Events = {
  newData: Data;
  pop: { componentId: string };
  defaultOptions: Record<string, any>;
  setRoot: {
    layout: LayoutRoot
  };
  navigate: {
    type: string
    params: {
      layout: LayoutNode
    }
  }
};
