import { Badge, Box, Card, Group, NumberInput, Progress, Table, Text, Title } from "@mantine/core";
import { createColumnHelper, flexRender, getCoreRowModel, getSortedRowModel, useReactTable, type SortingState } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { computeRankings, defaultRankingWeights, type RankingRow, type RankingWeights } from "@/features/rankings/rankingModel";
import { useWorkspaceData } from "@/query/workspaceHooks";

const columnHelper = createColumnHelper<RankingRow>();

function WeightInput({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return (
    <NumberInput
      label={label}
      value={value}
      min={0}
      max={100}
      step={5}
      size="xs"
      suffix="%"
      onChange={(next) => onChange(typeof next === "number" ? next : Number(next) || 0)}
    />
  );
}

export function RankingsPage() {
  const { data, isLoading } = useWorkspaceData();
  const [sorting, setSorting] = useState<SortingState>([{ id: "score", desc: true }]);
  const [weights, setWeights] = useState<RankingWeights>(defaultRankingWeights);
  const totalWeight = Object.values(weights).reduce((sum, value) => sum + value, 0);
  const rows = useMemo(() => computeRankings(data?.users ?? [], data?.projects ?? [], weights), [data?.projects, data?.users, weights]);

  const columns = useMemo(
    () => [
      columnHelper.accessor("rank", { header: "Rank", cell: (info) => <Badge variant="light">#{info.getValue()}</Badge> }),
      columnHelper.accessor((row) => row.user.displayName, { id: "member", header: "Member", cell: (info) => <Text fw={750}>{info.getValue()}</Text> }),
      columnHelper.accessor((row) => row.user.department || "General", { id: "team", header: "Team" }),
      columnHelper.accessor("score", { header: "Score", cell: (info) => <Text fw={800}>{info.getValue()}</Text> }),
      columnHelper.accessor("weightedTasks", { header: "Weighted tasks", cell: (info) => <Progress value={info.getValue()} size="sm" /> }),
      columnHelper.accessor("onTimeRate", { header: "On-time", cell: (info) => `${info.getValue()}%` }),
      columnHelper.accessor("quality", { header: "Quality", cell: (info) => `${info.getValue()}%` }),
      columnHelper.accessor("collaboration", { header: "Collaboration", cell: (info) => `${info.getValue()}%` }),
      columnHelper.accessor("milestone", { header: "Milestone", cell: (info) => `${info.getValue()}%` }),
      columnHelper.accessor("consistency", { header: "Consistency", cell: (info) => `${info.getValue()}%` }),
    ],
    [],
  );

  const table = useReactTable({
    data: rows,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <Box className="orbit-page">
      <Group justify="space-between" align="flex-start" mb="lg">
        <Box>
          <Title order={1}>Rankings</Title>
          <Text c="dimmed">Weighted rankings that expose every score component instead of rewarding raw task-count inflation.</Text>
        </Box>
        <Badge color={totalWeight === 100 ? "green" : "red"}>Weights total {totalWeight}%</Badge>
      </Group>
      <Card withBorder radius="sm" mb="md">
        <Text fw={800}>Scoring model</Text>
        <Text size="sm" c="dimmed" mb="md">
          Completed work, on-time completion, quality, collaboration, milestone contribution, and consistency are normalized to 100 and weighted below. Quality uses a neutral 70% baseline until approval data is migrated.
        </Text>
        <Group grow align="flex-start">
          <WeightInput label="Completed work" value={weights.completedWork} onChange={(completedWork) => setWeights((current) => ({ ...current, completedWork }))} />
          <WeightInput label="On-time" value={weights.onTime} onChange={(onTime) => setWeights((current) => ({ ...current, onTime }))} />
          <WeightInput label="Quality" value={weights.quality} onChange={(quality) => setWeights((current) => ({ ...current, quality }))} />
          <WeightInput label="Collaboration" value={weights.collaboration} onChange={(collaboration) => setWeights((current) => ({ ...current, collaboration }))} />
          <WeightInput label="Milestone" value={weights.milestone} onChange={(milestone) => setWeights((current) => ({ ...current, milestone }))} />
          <WeightInput label="Consistency" value={weights.consistency} onChange={(consistency) => setWeights((current) => ({ ...current, consistency }))} />
        </Group>
      </Card>
      <Card withBorder radius="sm" p={0}>
        <Table.ScrollContainer minWidth={980}>
          <Table verticalSpacing="sm" highlightOnHover>
            <Table.Thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <Table.Tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <Table.Th key={header.id} onClick={header.column.getToggleSortingHandler()} style={{ cursor: header.column.getCanSort() ? "pointer" : undefined }}>
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </Table.Th>
                  ))}
                </Table.Tr>
              ))}
            </Table.Thead>
            <Table.Tbody>
              {table.getRowModel().rows.map((row) => (
                <Table.Tr key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <Table.Td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</Table.Td>
                  ))}
                </Table.Tr>
              ))}
              {!rows.length && (
                <Table.Tr>
                  <Table.Td colSpan={columns.length}><Text c="dimmed">{isLoading ? "Loading rankings..." : "No ranking data yet."}</Text></Table.Td>
                </Table.Tr>
              )}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      </Card>
    </Box>
  );
}
