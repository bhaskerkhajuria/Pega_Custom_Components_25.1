// Pega Infinity 25.1 — Storybook stories

import type { Meta, StoryObj } from '@storybook/react';
import { PegaExtensionsSearchLayout, type PegaExtensionsSearchLayoutProps } from './index';

// ─── PCore mock setup ─────────────────────────────────────────────────────────
// In 25.1, window.PCore must be set up before rendering since components
// call PCore.getRefreshManager() etc. at runtime.

const setPCore = () => {
  (window as any).PCore = {
    getRefreshManager: () => ({
      triggerRefreshForType: () => {}
    }),
    getLocaleUtils: () => ({
      getLocaleValue: (val: string) => val
    })
  };
};

// ─── Mock getPConnect factory ─────────────────────────────────────────────────

function buildBasePConnect(overrides: Record<string, unknown> = {}) {
  return (() => ({
    getComponentName: () => '',
    getContextName: () => 'primary',
    getPageReference: () => '.SearchPage',
    getActionsApi: () => ({
      triggerFieldChange: () => {},
      updateFieldValue: () => {}
    }),
    getChildren: () => [],
    getStateProps: () => ({}),
    getConfigProps: () => ({}),
    getRawMetadata: () => ({}),
    getComponentsRegistry: () => ({
      getComponent: () => null
    }),
    createComponent: () => () => null,
    ...overrides
  })) as any;
}

// ─── Story type ───────────────────────────────────────────────────────────────

type Story = StoryObj<typeof PegaExtensionsSearchLayout>;

export default {
  title: 'Templates/Search Layout',
  component: PegaExtensionsSearchLayout,
  parameters: {
    layout: 'fullscreen',
    a11y: {
      context: '#storybook-root',
      config: {
        rules: [{ id: 'nested-interactive', enabled: false }]
      }
    }
  },
  argTypes: {
    layoutDirection: {
      control: { type: 'radio' },
      options: ['vertical', 'horizontal']
    },
    searchColumns: {
      control: { type: 'radio' },
      options: ['1', '2', '3']
    },
    searchPaneTitle: { control: 'text' },
    resultsPaneTitle: { control: 'text' },
    searchButtonLabel: { control: 'text' },
    resetButtonLabel: { control: 'text' },
    resultsPlaceholder: { control: 'text' },
    getPConnect: { table: { disable: true } }
  }
};

// ─── Stories ──────────────────────────────────────────────────────────────────

/** Default vertical split (resizable) */
export const Vertical: Story = {
  render: (args: PegaExtensionsSearchLayoutProps) => {
    setPCore();
    return <PegaExtensionsSearchLayout {...args} />;
  },
  args: {
    searchPaneTitle: 'Search Criteria',
    resultsPaneTitle: 'Search Results',
    searchButtonLabel: 'Search',
    resetButtonLabel: 'Reset',
    layoutDirection: 'vertical',
    searchColumns: '3',
    resultsPlaceholder: 'Enter search criteria and click Search.',
    getPConnect: buildBasePConnect()
  }
};

/** Horizontal stacked layout with collapse toggles */
export const Horizontal: Story = {
  render: (args: PegaExtensionsSearchLayoutProps) => {
    setPCore();
    return <PegaExtensionsSearchLayout {...args} />;
  },
  args: {
    ...Vertical.args,
    layoutDirection: 'horizontal',
    searchPaneTitle: 'Filters',
    resultsPaneTitle: 'Results'
  }
};

/** App Studio authoring preview */
export const AuthoringMode: Story = {
  name: 'Authoring (App Studio)',
  render: (args: PegaExtensionsSearchLayoutProps) => {
    setPCore();
    return <PegaExtensionsSearchLayout {...args} />;
  },
  args: {
    ...Vertical.args,
    getPConnect: buildBasePConnect({ getComponentName: () => 'AUTHORING' })
  }
};

/** Custom button and region titles */
export const CustomLabels: Story = {
  name: 'Custom Labels',
  render: (args: PegaExtensionsSearchLayoutProps) => {
    setPCore();
    return <PegaExtensionsSearchLayout {...args} />;
  },
  args: {
    ...Vertical.args,
    searchButtonLabel: 'Find',
    resetButtonLabel: 'Clear All',
    searchPaneTitle: 'Filter Criteria',
    resultsPaneTitle: 'Matching Records'
  }
};

/** Single column layout */
export const SingleColumn: Story = {
  name: '1 Column Search Pane',
  render: (args: PegaExtensionsSearchLayoutProps) => {
    setPCore();
    return <PegaExtensionsSearchLayout {...args} />;
  },
  args: {
    ...Vertical.args,
    searchColumns: '1'
  }
};