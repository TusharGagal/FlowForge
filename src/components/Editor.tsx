"use client"
import { useSuspenseWorkflow } from "@/app/features/workflows/hooks/useWorkflows"
import { ErrorView, LoadingView } from "./entity-components"
import {
    ReactFlow,
    applyEdgeChanges,
    applyNodeChanges,
    addEdge,
    type Node,
    type Edge,
    type NodeChange,
    type EdgeChange,
    type Connection,
    Background,
    Controls,
    MiniMap,
    Panel
} from "@xyflow/react"

import '@xyflow/react/dist/style.css';
import { useCallback, useState } from "react";
import { nodeComponents } from "@/config/node-component";
import { AddNodeButton } from "@/app/features/workflows/components/add-node-button";
export const EditorLoading = () => {
    return <LoadingView message="Loading Editor..." />
}
export const EditorError = () => {
    return <ErrorView message="Error while loading editor" />
}


export const Editor = ({ workflowId }: { workflowId: string }) => {
    const { data: workflow } = useSuspenseWorkflow(workflowId);
    const [nodes, setNodes] = useState<Node[]>(workflow.nodes);
    const [edges, setEdges] = useState<Edge[]>(workflow.edges);

    const onNodesChange = useCallback(
        (changes: NodeChange[]) => setNodes((nodesSnapshot) => applyNodeChanges(changes, nodesSnapshot)),
        [],
    );
    const onEdgesChange = useCallback(
        (changes: EdgeChange[]) => setEdges((edgesSnapshot) => applyEdgeChanges(changes, edgesSnapshot)),
        [],
    );
    const onConnect = useCallback(
        (params: Connection) => setEdges((edgesSnapshot) => addEdge(params, edgesSnapshot)),
        [],
    );

    return (
        <div className="size-full">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                nodeTypes={nodeComponents}
                fitView
                proOptions={{ hideAttribution: true }}
                className="text-primary"
            >
                <Background />
                <Controls />
                <MiniMap />
                <Panel position="top-right">
                    <AddNodeButton />
                </Panel>
            </ReactFlow>

        </div>
    )
}