// Pega Infinity 25.1 — Pega_Extensions_SearchLayout

import {
  useRef,
  useState,
  useCallback,
  useEffect,
  type PropsWithChildren,
  type ReactElement
} from 'react';
import type { KeyboardEvent } from 'react';
import { withConfiguration } from '@pega/cosmos-react-core';
import type { PConnProps } from '../shared/PConnProps';
import {
  Button,
  Card,
  CardHeader,
  CardContent,
  CardFooter
} from '@pega/cosmos-react-core';
import '../shared/create-nonce';

import StyledSearchLayoutWrapper, {
  StyledLayoutContainer,
  StyledResizeHandle,
  StyledCaretButton,
  StyledSearchFieldsGrid
} from './styles';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PegaExtensionsSearchLayoutProps extends PConnProps {
  /** Title shown in the search criteria card header */
  searchPaneTitle?: string;
  /** Title shown in the search results card header */
  resultsPaneTitle?: string;
  /** Label for the search button */
  searchButtonLabel?: string;
  /** Label for the reset button */
  resetButtonLabel?: string;
  /** Layout direction — vertical (side-by-side) or horizontal (stacked) */
  layoutDirection?: 'vertical' | 'horizontal';
  /** Number of columns for the search criteria fields (1, 2, or 3) */
  searchColumns?: '1' | '2' | '3';
  /** Placeholder text shown in the results pane before search is triggered */
  resultsPlaceholder?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const PegaExtensionsSearchLayout = (
  props: PropsWithChildren<PegaExtensionsSearchLayoutProps>
) => {
  const {
    getPConnect,
    searchPaneTitle = 'Search Criteria',
    resultsPaneTitle = 'Search Results',
    searchButtonLabel = 'Search',
    resetButtonLabel = 'Reset',
    layoutDirection = 'vertical',
    searchColumns = '3',
    resultsPlaceholder = 'Enter search criteria and click Search.',
    children
  } = props;

  // ─── State ──────────────────────────────────────────────────────────────────

  const [searchTriggered, setSearchTriggered] = useState(false);
  const [splitPercent, setSplitPercent] = useState(30);
  const [searchCollapsed, setSearchCollapsed] = useState(false);
  const [resultsCollapsed, setResultsCollapsed] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  // ─── Slot extraction ────────────────────────────────────────────────────────
  // Constellation renders each CONTENTPICKER slot as a child in config order:
  // children[0] = searchFieldPane, children[1] = resultsPane

  const childArray = children as ReactElement[];
  const searchFieldPaneChild = childArray?.[0] ?? null;
  const resultsPaneChild = childArray?.[1] ?? null;

  // ─── Search handler ─────────────────────────────────────────────────────────

  const handleSearch = useCallback(() => {
    setSearchTriggered(true);
    const context = getPConnect().getContextName();
    (window as any).PCore.getRefreshManager().triggerRefreshForType('CASE_UPDATE', '', context);
  }, [getPConnect]);

  // ─── Reset handler ──────────────────────────────────────────────────────────

  const handleReset = useCallback(() => {
    const pConn = getPConnect();
    const context = pConn.getContextName();
    const pageRef = pConn.getPageReference();

    const templateChildren: { getPConnect: () => any }[] = pConn.getChildren() ?? [];
    const searchPaneChildren: { getPConnect: () => any }[] =
      templateChildren[0]?.getPConnect().getChildren() ?? [];

    searchPaneChildren.forEach((childObj: { getPConnect: () => any }) => {
      const childPConn = childObj.getPConnect();
      const stateProps = childPConn.getStateProps() ?? {};
      const valueKey = stateProps.value;
      if (!valueKey) return;

      const configProps = childPConn.getConfigProps() ?? {};
      const rawMeta = childPConn.getRawMetadata() ?? {};
      const refRaw: string =
        configProps.reference ?? rawMeta?.config?.value ?? '';
      if (!refRaw) return;

      const cleanRef = refRaw.replace(/^@P[\s]+/u, '').trim();
      const actionsApi = pConn.getActionsApi();
      actionsApi.updateFieldValue(cleanRef, '');
    });

    (window as any).PCore.getRefreshManager().triggerRefreshForType(
      'PROP_CHANGE',
      pageRef,
      context
    );
    setSearchTriggered(false);
  }, [getPConnect]);

  // ─── Resize handle (vertical layout) ────────────────────────────────────────

  const handleMouseDown = useCallback(() => {
    isDragging.current = true;
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const rawPercent = ((e.clientX - rect.left) / rect.width) * 100;
      setSplitPercent(Math.min(70, Math.max(20, rawPercent)));
    };
    const handleMouseUp = () => {
      isDragging.current = false;
    };
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const handleResizeKeyDown = useCallback((e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowLeft') setSplitPercent(p => Math.max(20, p - 2));
    if (e.key === 'ArrowRight') setSplitPercent(p => Math.min(70, p + 2));
  }, []);

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <StyledSearchLayoutWrapper>
      <StyledLayoutContainer ref={containerRef} $direction={layoutDirection}>

        {/* ── Search Criteria Card ── */}
        <Card
          style={{
            width: layoutDirection === 'vertical' ? `${splitPercent}%` : '100%',
            minWidth: layoutDirection === 'vertical' ? '200px' : undefined,
            flexShrink: layoutDirection === 'vertical' ? 0 : undefined,
            overflow: searchCollapsed ? 'hidden' : undefined,
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <CardHeader
            id='search-pane-heading'
            actions={
              layoutDirection === 'horizontal' ? (
                <StyledCaretButton
                  variant='simple'
                  aria-expanded={!searchCollapsed}
                  aria-controls='search-pane-content'
                  onClick={() => setSearchCollapsed(c => !c)}
                >
                  {searchCollapsed ? '▼' : '▲'}
                </StyledCaretButton>
              ) : undefined
            }
          >
            {searchPaneTitle}
          </CardHeader>

          {!searchCollapsed && (
            <>
              <CardContent
                id='search-pane-content'
                role='region'
                aria-labelledby='search-pane-heading'
              >
                <StyledSearchFieldsGrid $columns={Number(searchColumns)}>
                  {searchFieldPaneChild}
                </StyledSearchFieldsGrid>
              </CardContent>

              <CardFooter justify='end'>
                <Button variant='secondary' onClick={handleReset}>
                  {resetButtonLabel}
                </Button>
                <Button variant='primary' onClick={handleSearch}>
                  {searchButtonLabel}
                </Button>
              </CardFooter>
            </>
          )}
        </Card>

        {/* ── Resize Handle (vertical only) ── */}
        {layoutDirection === 'vertical' && (
          <StyledResizeHandle
            role='separator'
            aria-label='Resize search and results panels'
            aria-valuenow={splitPercent}
            aria-valuemin={20}
            aria-valuemax={70}
            tabIndex={0}
            onMouseDown={handleMouseDown}
            onKeyDown={handleResizeKeyDown}
          />
        )}

        {/* ── Search Results Card ── */}
        <Card
          style={{
            flex: '1 1 auto',
            minWidth: 0,
            overflow: resultsCollapsed ? 'hidden' : undefined,
            boxSizing: 'border-box'
          }}
        >
          <CardHeader
            id='results-pane-heading'
            actions={
              layoutDirection === 'horizontal' ? (
                <StyledCaretButton
                  variant='simple'
                  aria-expanded={!resultsCollapsed}
                  aria-controls='results-pane-content'
                  onClick={() => setResultsCollapsed(c => !c)}
                >
                  {resultsCollapsed ? '▼' : '▲'}
                </StyledCaretButton>
              ) : undefined
            }
          >
            {resultsPaneTitle}
          </CardHeader>

          {!resultsCollapsed && (
            <CardContent
              id='results-pane-content'
              role='region'
              aria-labelledby='results-pane-heading'
            >
              {searchTriggered ? (
                resultsPaneChild
              ) : (
                <p style={{ color: 'var(--app-text-secondary)', textAlign: 'center', margin: '2rem 0' }}>
                  {resultsPlaceholder}
                </p>
              )}
            </CardContent>
          )}
        </Card>

      </StyledLayoutContainer>
    </StyledSearchLayoutWrapper>
  );
};

export default withConfiguration(PegaExtensionsSearchLayout);