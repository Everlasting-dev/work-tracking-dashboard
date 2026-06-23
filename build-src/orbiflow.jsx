/* orbiflow.jsx — React Flow (xyflow) island for the project task-dependency map.
 * Bundled by esbuild into vendor/orbiflow/orbiflow.js as a single offline IIFE
 * that exposes window.OrbiFlow.mount(). The legacy vanilla app calls mount()
 * with plain task/edge data and a couple of callbacks — all React lives here.
 *
 * Rebuild after editing:  npm run build:orbiflow
 */
import React, { useCallback, useMemo, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import {
  ReactFlow, ReactFlowProvider, Background, BackgroundVariant, Controls, MiniMap,
  Handle, Position, useNodesState, useEdgesState, addEdge, useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

const NODE_W = 220;
const COL_GAP = 300;
const ROW_GAP = 128;

// Longest-path layering so dependencies flow left → right, like the reference.
function layout(nodes, edges) {
  const ids = nodes.map((n) => n.id);
  const idSet = new Set(ids);
  const incoming = Object.fromEntries(ids.map((id) => [id, 0]));
  const valid = edges.filter((e) => idSet.has(e.source) && idSet.has(e.target));
  valid.forEach((e) => { incoming[e.target] = (incoming[e.target] || 0) + 1; });

  const level = {};
  const queue = ids.filter((id) => incoming[id] === 0);
  queue.forEach((id) => { level[id] = 0; });
  const counts = { ...incoming };
  let guard = 0;
  while (queue.length && guard++ < 5000) {
    const id = queue.shift();
    valid.filter((e) => e.source === id).forEach((e) => {
      level[e.target] = Math.max(level[e.target] || 0, (level[id] || 0) + 1);
      counts[e.target] -= 1;
      if (counts[e.target] === 0) queue.push(e.target);
    });
  }
  ids.forEach((id, i) => { if (level[id] == null) level[id] = i % 4; });

  const perLevel = {};
  const pos = {};
  ids.forEach((id) => {
    const lv = level[id] || 0;
    perLevel[lv] = perLevel[lv] || 0;
    pos[id] = { x: 40 + lv * COL_GAP, y: 32 + perLevel[lv] * ROW_GAP };
    perLevel[lv] += 1;
  });
  return pos;
}

// Custom task card node: status header strip, title, assignee, due date, priority.
function OrbiNode({ data }) {
  return (
    <div className="orbi-node" style={{ width: NODE_W }}>
      <div className="orbi-node-header" style={{ background: data.headerColor }}>
        <span className="orbi-node-status">{data.statusLabel}</span>
        {data.priority ? <span className={`orbi-node-prio orbi-prio-${data.priority}`} /> : null}
      </div>
      <div className="orbi-node-body">
        <div className="orbi-node-title">{data.title}</div>
        <div className="orbi-node-meta">
          <span className="orbi-node-who">
            {data.avatar ? <span className="orbi-node-avatar" style={{ background: data.avatarColor || '#64748b' }}>{data.avatar}</span> : null}
            {data.who}
          </span>
          {data.due ? <span className={`orbi-node-due${data.overdue ? ' orbi-node-due--late' : ''}`}>{data.due}</span> : null}
        </div>
      </div>
      <Handle type="target" position={Position.Left} className="orbi-handle" />
      <Handle type="source" position={Position.Right} className="orbi-handle" />
    </div>
  );
}

const nodeTypes = { orbi: OrbiNode };

function Graph({ data, handlers }) {
  const pos = useMemo(() => layout(data.nodes, data.edges), [data]);

  const rf = useReactFlow();
  useEffect(() => {
    if (handlers.onReady) handlers.onReady({ fitView: () => { try { rf.fitView({ padding: 0.2, duration: 300 }); } catch (_) {} } });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const initialNodes = useMemo(() => data.nodes.map((n) => ({
    id: n.id,
    type: 'orbi',
    position: pos[n.id] || { x: 40, y: 40 },
    data: { title: n.title, statusLabel: n.statusLabel, headerColor: n.headerColor, who: n.who, priority: n.priority, due: n.due, overdue: n.overdue, avatar: n.avatar, avatarColor: n.avatarColor },
  })), [data, pos]);

  const initialEdges = useMemo(() => data.edges.map((e) => ({
    id: `e-${e.source}-${e.target}`,
    source: e.source,
    target: e.target,
    type: 'default',
    animated: false,
    style: { stroke: '#38bdf8', strokeWidth: 2 },
  })), [data]);

  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback((params) => {
    if (!data.editable) return;
    if (params.source === params.target) return;
    setEdges((eds) => addEdge({
      ...params,
      id: `e-${params.source}-${params.target}`,
      animated: false,
      style: { stroke: '#38bdf8', strokeWidth: 2 },
    }, eds));
    handlers.onConnect && handlers.onConnect(params.source, params.target);
  }, [data.editable, setEdges, handlers]);

  const onNodeClick = useCallback((_e, node) => {
    handlers.onNodeClick && handlers.onNodeClick(node.id);
  }, [handlers]);

  // Click a link to remove the dependency (or select it and press Delete).
  const onEdgeClick = useCallback((_e, edge) => {
    if (!data.editable || !handlers.onUnlink) return;
    if (!window.confirm('Remove this dependency link?')) return;
    setEdges((eds) => eds.filter((e) => e.id !== edge.id));
    handlers.onUnlink(edge.source, edge.target);
  }, [data.editable, setEdges, handlers]);

  // Keyboard / programmatic edge removal (Delete key on a selected link).
  const onEdgesDelete = useCallback((deleted) => {
    if (!data.editable || !handlers.onUnlink) return;
    deleted.forEach((e) => handlers.onUnlink(e.source, e.target));
  }, [data.editable, handlers]);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      onNodeClick={onNodeClick}
      onEdgeClick={onEdgeClick}
      onEdgesDelete={onEdgesDelete}
      nodesConnectable={!!data.editable}
      fitView
      fitViewOptions={{ padding: 0.2 }}
      minZoom={0.2}
      maxZoom={2}
      proOptions={{ hideAttribution: true }}
    >
      <Background variant={BackgroundVariant.Dots} gap={22} size={1.4} color="rgba(148,163,184,0.35)" />
      <MiniMap pannable zoomable nodeColor={(n) => n.data?.headerColor || '#64748b'} />
      <Controls showInteractive={false} />
    </ReactFlow>
  );
}

const roots = new WeakMap();

function mount(container, data, handlers = {}) {
  if (!container) return;
  let root = roots.get(container);
  if (!root) {
    root = createRoot(container);
    roots.set(container, root);
  }
  let api = null;
  const wrapped = { ...handlers, onReady: (a) => { api = a; handlers.onReady && handlers.onReady(a); } };
  root.render(
    <ReactFlowProvider>
      <Graph data={data} handlers={wrapped} />
    </ReactFlowProvider>
  );
  return {
    unmount() { try { root.unmount(); } catch (_) {} roots.delete(container); },
    fitView() { try { api && api.fitView(); } catch (_) {} },
  };
}

window.OrbiFlow = { mount };
