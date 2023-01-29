import React from 'react';
import { Button } from 'antd';
import { Options } from 'react-native-navigation';

import {
  PluginClient,
  usePlugin,
  createState,
  useValue,
  Layout,
  DataTable,
} from 'flipper-plugin';

import SideBar from './components/SideBar';
import {TimelineTableColumns} from './constants';
import {LayoutNode, Stack, Events, TimelineItem, Methods} from './types';

export function plugin(client: PluginClient<Events, Methods>) {
  const defaultOptions = createState<Options>({}, {persist: 'defaultOptions'});
  const rootLayout = createState<LayoutNode>({}, {persist: 'rootLayout'});
  const currentScreen = createState<LayoutNode>({}, {persist: 'currentScreen'});
  const navigationTimeline = createState<TimelineItem[]>([], { persist: 'navigationTimeline' })
  const navigationStack = createState<Stack[]>([], {persist: 'navigationStack'});

  client.onMessage('defaultOptions', (options) => {
    defaultOptions.set(options)
  });

  client.onMessage('setRoot', ({ layout }) => {
    const root = layout.root as LayoutNode;
    const childrenLength = root.children?.length ?? 0;
    const isTabNavigation = root.type === "BottomTabs" || childrenLength > 1
    const currentChildrenIndex = isTabNavigation ? defaultOptions.get()?.bottomTabs?.currentTabIndex ?? 0 : 0
    const firstScreen = root?.children?.[currentChildrenIndex];

    const item = isTabNavigation ? firstScreen?.children?.[0] : firstScreen;

    navigationTimeline.set([
      {
        id: item?.id,
        hasPop: false,
        type: item?.type,
        data: item?.data,
        action: root.type,
        context: item?.id,
        screen: item?.data?.name,
      }
    ])

    currentScreen.set(item as LayoutNode)
    rootLayout.set(root)
  });

  client.onMessage('pop', ({ componentId }) => {
    navigationStack.update((draft) => {
      return [...draft].slice(0, -1)
    })
  });

  client.onMessage('navigate', ({ type, params }) => {
    const screen = params.layout.type === 'Component' ? params.layout : params.layout?.children?.[0];

    const nextScreen = { screen: screen?.data?.name, componentId: screen?.id };
    const hasPop = type === 'push'

    if (type === 'push') {
      navigationStack.update((draft) => {
        return [...draft, nextScreen]
      })
    } else if (type === 'pop') {
      navigationStack.update((draft) => {
        return [...draft].slice(0, -1)
      })
    } else if (type === 'setStackRoot') {
      navigationStack.update((draft) => {
        return [nextScreen]
      })
    }

    navigationTimeline.update(draft => {
      return [
        ...draft,
        {
          hasPop,
          action: type,
          id: screen?.id,
          data: screen?.data,
          type: screen?.type,
          context: screen?.id,
          screen: screen?.data?.name,
        }
      ]
    })

    currentScreen.set(params.layout)
  });

  const navigate = (params: any) => {
    client.send('navigate', params as never)
  }

  const updateProps = (params: { context: string, props: Record<string, any> }) => {
    client.send('updateProps', params as never)
  }

  const updateOptions = (params: { context: string, options: Options }) => {
    client.send('updateOptions', params as never)
  }

  const selectRow = (row: any) => {
    // TODO some...
  }

  const clearItems = () => {
    navigationTimeline.set([])
  }

  return {
    currentScreen,
    defaultOptions,
    navigationTimeline,

    /* actions */
    navigate,
    selectRow,
    clearItems,
    updateProps,
    updateOptions,
  };
}

// Read more: https://fbflipper.com/docs/tutorial/js-custom#building-a-user-interface-for-the-plugin
// API: https://fbflipper.com/docs/extending/flipper-plugin#react-hooks
export function Component() {
  const instance = usePlugin(plugin);

  const rows = useValue(instance.navigationTimeline);
  const currentScreen = useValue(instance.currentScreen);
  const defaultOptions = useValue(instance.defaultOptions);

  return (
    <>
      <div style={{ display: "flex", justifyContent: "center", backgroundColor: "#f2f2f2" }}>
        <img src="https://wix.github.io/react-native-navigation/img/logo.png" alt="" style={{ width: 118, height: 100 }} />
      </div>
      <DataTable<Record<string, any>>
        records={rows}
        enableSearchbar={true}
        enableAutoScroll={true}
        enableMultiSelect={false}
        enableColumnHeaders={true}
        onSelect={instance.selectRow}
        columns={TimelineTableColumns}
        extraActions={<Button onClick={instance.clearItems}>Clear</Button>}
      />
      <Layout.Container>

      </Layout.Container>
      <SideBar
        currentScreen={currentScreen}
        defaultOptions={defaultOptions}
        updateProps={instance.updateProps}
        updateOptions={instance.updateOptions}
      />
    </>
  );
}
