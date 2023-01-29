import {Button, Input} from "antd";
import merge from 'lodash.merge';

import {Options} from "react-native-navigation";
import React, {memo, useCallback, useEffect, useMemo, useState} from 'react';
import {DataInspector, DetailSidebar, Panel, Tab, Tabs} from "flipper-plugin";

import {updateObjAttribute} from '../utils';

interface SideBarProps {
  currentScreen: any
  defaultOptions: Options
  updateOptions: (params: { options: Options, context: string }) => void
  updateProps: (params: { props: Record<string, any>, context: string }) => void
}

function SideBar(props: SideBarProps) {
  const { updateProps, updateOptions, currentScreen, defaultOptions } = props;

  const currentScreenProps = currentScreen?.data?.passProps;
  const currentScreenOptions = currentScreen?.data?.options;

  // Local state
  const [propsError, setPropsError] = useState('');
  const [optionsError, setOptionsError] = useState('');

  const [screenProps, setScreenProps] = useState(undefined);
  const [screenOptions, setScreenOptions] = useState(undefined);

  const [newProps, setNewProps] = useState('');
  const [newOptions, setNewOptions] = useState('');

  useEffect(() => {
    setScreenProps(currentScreenProps)
  }, [currentScreenProps])

  useEffect(() => {
    setScreenOptions(currentScreenOptions)
  }, [currentScreenOptions])

  const addNewProps = useCallback(() => {
    setPropsError('');

    try {
      const _props = screenProps
        ? merge({}, screenProps, JSON.parse(newProps))
        : JSON.parse(newProps);

      setScreenProps(_props);

      updateProps({
        props: _props,
        context: currentScreen?.id as string,
      })

      setNewProps('')
    } catch (e) {
      setPropsError('Wrong JSON format')
    }
  }, [screenProps, newProps]);

  const addNewOptions = useCallback(() => {
    setOptionsError('');

    try {
      const _options = screenOptions
        ? merge({}, screenOptions, JSON.parse(newOptions)) :
        JSON.parse(newOptions);

      setScreenOptions(_options)

      updateOptions({
        options: merge({}, screenOptions, JSON.parse(newOptions)),
        context: currentScreen?.id as string,
      })

      setNewOptions('');
    } catch (e) {
      setOptionsError('Wrong JSON format')
    }
  }, [screenOptions, newOptions]);

  const applyNewProps = useCallback(() => {
    if (screenProps) {
      updateProps({
        props: screenProps,
        context: currentScreen?.id as string,
      })
    }
  }, [currentScreenProps])

  const applyNewOptions = useCallback(() => {
    if (screenOptions) {
      updateOptions({
        options: screenOptions,
        context: currentScreen?.id as string,
      })
    }
  }, [screenOptions])

  const onAttributeChange = useCallback((path: string[], val: any) => {
    if (screenProps) {
      setScreenProps(
        updateObjAttribute(path, screenProps, val)
      )
    }
  }, [screenProps])

  const onOptionsAttributeChange = useCallback((path: string[], val: any) => {
    if (screenOptions) {
      setScreenOptions(
        updateObjAttribute(path, screenOptions, val)
      )
    }
  }, [screenOptions])

  const renderEmptyBlock = useCallback((description = 'attributes') => {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 16 }}>
        <span>No {description} to change</span>
      </div>
    )
  }, [])

  const renderScreenProps = useMemo(() => {
    console.log('LOG ::::::> screenProps <::::::',screenProps)
    return (
      <div style={{ paddingBottom: 16, paddingTop: 16 }}>
        {screenProps ? (
          <DataInspector
            collapsed={true}
            expandRoot={true}
            data={screenProps}
            setValue={onAttributeChange}
          />
        ) : renderEmptyBlock('props')}
      </div>
    );
  }, [screenProps])

  const renderAddProps = useMemo(() => {
    return (
      <div style={{ paddingBottom: 16, paddingTop: 16 }}>
        <Input.TextArea status={propsError ? "error" : undefined} rows={4} onChange={(e) => setNewProps(e.target.value)} value={newProps} />
        <span style={{ color: 'red' }}>{propsError}</span>
      </div>
    );
  }, [newProps, propsError])

  const renderAddOptions = useMemo(() => {
    return (
      <div style={{ paddingBottom: 16, paddingTop: 16 }}>
        <Input.TextArea status={optionsError ? "error" : undefined} rows={4} onChange={(e) => setNewOptions(e.target.value)} value={newOptions} />
        <span style={{ color: 'red' }}>{optionsError}</span>
      </div>
    );
  }, [newOptions, optionsError])

  const renderScreenOptions = useMemo(() => {
    return (
      <div style={{ paddingBottom: 16, paddingTop: 16 }}>
        {screenOptions ? (
          <DataInspector
            collapsed={true}
            expandRoot={true}
            data={screenOptions}
            setValue={onOptionsAttributeChange}
          />
        ) : renderEmptyBlock('option')}
      </div>
    );
  }, [screenOptions])

  return (
    <DetailSidebar>
      <Panel collapsed={false} title="Props" gap pad>
        <Tabs defaultActiveKey="update" centered={true}>
          <Tab tab="Update" tabKey="update">
            <div style={{ display: "flex", flexDirection: 'column', paddingBottom: 8 }}>
              {renderScreenProps}
              <Button disabled={!screenProps} type="primary" onClick={applyNewProps}>Update props</Button>
            </div>
          </Tab>
          <Tab tab="Add" tabKey="add">
            <div style={{ display: "flex", flexDirection: 'column', paddingBottom: 8 }}>
              {renderAddProps}
              <Button type="primary" onClick={addNewProps}>Add props</Button>
            </div>
          </Tab>
        </Tabs>
      </Panel>
      <Panel collapsed={false} title="Options" gap pad>
        <Tabs defaultActiveKey="update" centered={true}>
          <Tab tab="Update" tabKey="update">
            <div style={{ display: "flex", flexDirection: 'column', paddingBottom: 8 }}>
              {renderScreenOptions}
              <Button disabled={!screenOptions} type="primary" onClick={applyNewOptions}>Update options</Button>
            </div>
          </Tab>
          <Tab tab="Add" tabKey="add">
            <div style={{ display: "flex", flexDirection: 'column', paddingBottom: 8 }}>
              {renderAddOptions}
              <Button type="primary" onClick={addNewOptions}>Add options</Button>
            </div>
          </Tab>
        </Tabs>
      </Panel>
      <Panel title="Default options" gap pad>
        <DataInspector
          collapsed={true}
          expandRoot={true}
          data={defaultOptions}
        />
      </Panel>
    </DetailSidebar>
  );
}

export default memo(SideBar);
