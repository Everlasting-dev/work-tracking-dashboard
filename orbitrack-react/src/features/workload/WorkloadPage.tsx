import { Badge, Box, Card, Group, Progress, Select, SimpleGrid, Table, Text, Title } from "@mantine/core";
import { useMemo, useState } from "react";
import { useWorkload } from "@/query/workspaceHooks";

function loadTone(load: number) {
  if (load >= 10) return "red";
  if (load >= 6) return "yellow";
  return "green";
}

export function WorkloadPage() {
  const { data = [], isLoading } = useWorkload();
  const [level, setLevel] = useState<string | null>("all");
  const filtered = data.filter((row) => {
    if (level === "heavy") return row.load >= 10;
    if (level === "medium") return row.load >= 6 && row.load < 10;
    if (level === "light") return row.load < 6;
    return true;
  });
  const totals = useMemo(() => ({
    open: data.reduce((sum, row) => sum + row.open.length, 0),
    blocked: data.reduce((sum, row) => sum + row.blocked.length, 0),
    load: data.reduce((sum, row) => sum + row.load, 0),
  }), [data]);

  return (
    <Box className="orbit-page">
      <Group justify="space-between" align="flex-start" mb="lg">
        <Box>
          <Title order={1}>Workload</Title>
          <Text c="dimmed">A lightweight capacity planner using rows, columns, and CSS bars instead of canvas or WebGL.</Text>
        </Box>
        <Select
          data={[
            { value: "all", label: "All workload" },
            { value: "light", label: "Light" },
            { value: "medium", label: "Moderate" },
            { value: "heavy", label: "Heavy" },
          ]}
          value={level}
          onChange={setLevel}
          allowDeselect={false}
          w={180}
        />
      </Group>
      <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md" mb="md">
        <Card withBorder radius="sm"><Text c="dimmed" size="sm">Open work</Text><Title order={2}>{totals.open}</Title></Card>
        <Card withBorder radius="sm"><Text c="dimmed" size="sm">Blockers</Text><Title order={2}>{totals.blocked}</Title></Card>
        <Card withBorder radius="sm"><Text c="dimmed" size="sm">Capacity load</Text><Title order={2}>{totals.load}</Title></Card>
      </SimpleGrid>
      <Card withBorder radius="sm" p={0}>
        <Table.ScrollContainer minWidth={760}>
          <Table verticalSpacing="md">
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Member</Table.Th>
                <Table.Th>Capacity</Table.Th>
                <Table.Th>Open</Table.Th>
                <Table.Th>Blocked</Table.Th>
                <Table.Th>Risk</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {filtered.map((row) => {
                const value = Math.min(100, row.load * 10);
                return (
                  <Table.Tr key={row.user.id}>
                    <Table.Td>
                      <Text fw={750}>{row.user.displayName}</Text>
                      <Text c="dimmed" size="sm">{row.user.department || "General"} · {row.user.role || "Member"}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Progress value={value} color={loadTone(row.load)} radius="xl" />
                    </Table.Td>
                    <Table.Td>{row.open.length}</Table.Td>
                    <Table.Td>{row.blocked.length}</Table.Td>
                    <Table.Td><Badge color={loadTone(row.load)}>{row.load >= 10 ? "Overloaded" : row.load >= 6 ? "Watch" : "Healthy"}</Badge></Table.Td>
                  </Table.Tr>
                );
              })}
              {!filtered.length && (
                <Table.Tr>
                  <Table.Td colSpan={5}><Text c="dimmed">{isLoading ? "Loading workload..." : "No workload rows match this filter."}</Text></Table.Td>
                </Table.Tr>
              )}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      </Card>
    </Box>
  );
}
