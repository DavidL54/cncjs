import difference from 'lodash/difference';
import get from 'lodash/get';
import includes from 'lodash/includes';
import union from 'lodash/union';
import React from 'react';
import {
  GRBL,
  MARLIN,
  SMOOTHIE,
  TINYG,
} from '@app/constants/controller';
import controller from '@app/lib/controller';
import portal from '@app/lib/portal';
import config from '@app/store/config';
import WidgetManager from './WidgetManager';

export const getActiveWidgets = () => {
  const defaultWidgets = config.get('workspace.container.default.widgets', [])
    .map(widgetId => widgetId.split(':')[0]);
  const primaryWidgets = config.get('workspace.container.primary.widgets', [])
    .map(widgetId => widgetId.split(':')[0]);
  const secondaryWidgets = config.get('workspace.container.secondary.widgets', [])
    .map(widgetId => widgetId.split(':')[0]);
  const activeWidgets = union(defaultWidgets, primaryWidgets, secondaryWidgets)
    .filter(widget => {
      if (widget === 'grbl' && !includes(controller.availableControllers, GRBL)) {
        return false;
      }
      if (widget === 'marlin' && !includes(controller.availableControllers, MARLIN)) {
        return false;
      }
      if (widget === 'smoothie' && !includes(controller.availableControllers, SMOOTHIE)) {
        return false;
      }
      if (widget === 'tinyg' && !includes(controller.availableControllers, TINYG)) {
        return false;
      }
      return true;
    });

  return activeWidgets;
};

export const getInactiveWidgets = () => {
  const allWidgets = Object.keys(get(config.getDefaultState(), 'widgets'));
  const defaultWidgets = config.get('workspace.container.default.widgets', [])
    .map(widgetId => widgetId.split(':')[0]);
  const primaryWidgets = config.get('workspace.container.primary.widgets', [])
    .map(widgetId => widgetId.split(':')[0]);
  const secondaryWidgets = config.get('workspace.container.secondary.widgets', [])
    .map(widgetId => widgetId.split(':')[0]);
  const inactiveWidgets = difference(allWidgets, defaultWidgets, primaryWidgets, secondaryWidgets)
    .filter(widget => {
      if (widget === 'grbl' && !includes(controller.availableControllers, GRBL)) {
        return false;
      }
      if (widget === 'marlin' && !includes(controller.availableControllers, MARLIN)) {
        return false;
      }
      if (widget === 'smoothie' && !includes(controller.availableControllers, SMOOTHIE)) {
        return false;
      }
      if (widget === 'tinyg' && !includes(controller.availableControllers, TINYG)) {
        return false;
      }
      return true;
    });

  return inactiveWidgets;
};

// @param {string} targetContainer The target container: primary|secondary
export const show = (callback) => {
  portal(({ onClose }) => (
    <WidgetManager
      onSave={callback}
      onClose={onClose}
    />
  ));
};
