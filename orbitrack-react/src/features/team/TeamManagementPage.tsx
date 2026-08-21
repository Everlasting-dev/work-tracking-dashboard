import { Badge, Box, Button, Card, Group, Select, SimpleGrid, Table, Text, TextInput, Title } from "@mantine/core";
import { Archive, Plus, Search, UserRoundCog } from "lucide-react";
import { useMemo, useState } from "react";
import { useWorkload } from "@/query/workspaceHooks";

export function TeamManagementPage() {
  const { data = [], isLoading } = useWorkload();
  const [query, setQuery] = useState("");
  const [department, setDepartment] = useState<string | null>("all");
  const departments = useMemo(
    () => ["all", ...Array.from(new Set(data.map((row) => row.user.department).filter(Boolean)))],
    [data],
  );
  const filtered = data.filter((row) => {
    const haystack = `${row.user.displayName} ${row.user.username} ${row.user.role} ${row.user.department}`.toLowerCase();
    const matchesQuery = haystack.includes(query.trim().toLowerCase());
    const matchesDepartment = department === "all" || !department || row.user.department === department;
    return matchesQuery && matchesDepartment;
  });

  return (
    <Box className="orbit-page">
      <Group justify="space-between" align="flex-start" mb="lg">
        <Box>
          <Title order={1}>Team Management</Title>
          <Text c="dimmed">Foundation for members, teams, roles, permissions, workload, blockers, and bulk actions.</Text>
        </Box>
        <Group>
          <Button leftSection={<Archive size={14} />} variant="default" disabled>Archive team</Button>
          <Button leftSection={<Plus size={14} />} disabled>Create team</Button>
        </Group>
      </Group>

      <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md" mb="md">
        <Card withBorder radius="sm">
          <Text size="sm" c="dimmed">Members</Text>
          <Title order={2}>{data.length}</Title>
        </Card>
        <Card withBorder radius="sm">
          <Text size="sm" c="dimmed">Open assignments</Text>
          <Title order={2}>{data.reduce((sum, row) => sum + row.open.length, 0)}</Title>
        </Card>
        <Card withBorder radius="sm">
          <Text size="sm" c="dimmed">Blockers</Text>
          <Title order={2}>{data.reduce((sum, row) => sum + row.blocked.length, 0)}</Title>
        </Card>
      </SimpleGrid>

      <Card withBorder radius="sm" mb="md">
        <Group>
          <TextInput value={query} onChange={(event) => setQuery(event.currentTarget.value)} leftSection={<Search size={14} />} placeholder="Search members, roles, teams" flex={1} />
          <Select data={departments.map((item) => ({ value: item, label: item === "all" ? "All teams" : item }))} value={department} onChange={setDepartment} w={180} allowDeselect={false} />
        </Group>
      </Card>

      <Card withBorder radius="sm" p={0}>
        <Table.ScrollContainer minWidth={820}>
          <Table verticalSpacing="sm" highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Member</Table.Th>
                <Table.Th>Team</Table.Th>
                <Table.Th>Role</Table.Th>
                <Table.Th>Open</Table.Th>
                <Table.Th>Done</Table.Th>
                <Table.Th>Blockers</Table.Th>
                <Table.Th>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {filtered.map((row) => (
                <Table.Tr key={row.user.id}>
                  <Table.Td>
                    <Text fw={750}>{row.user.displayName}</Text>
                    <Text size="sm" c="dimmed">@{row.user.username}</Text>
                  </Table.Td>
                  <Table.Td>{row.user.department || "General"}</Table.Td>
                  <Table.Td><Badge variant="light">{row.user.role || "Member"}</Badge></Table.Td>
                  <Table.Td>{row.open.length}</Table.Td>
                  <Table.Td>{row.done.length}</Table.Td>
                  <Table.Td><Badge color={row.blocked.length ? "red" : "gray"}>{row.blocked.length}</Badge></Table.Td>
                  <Table.Td>
                    <Button size="xs" variant="default" leftSection={<UserRoundCog size={13} />} disabled>
                      Manage
                    </Button>
                  </Table.Td>
                </Table.Tr>
              ))}
              {!filtered.length && (
                <Table.Tr>
                  <Table.Td colSpan={7}>
                    <Text c="dimmed">{isLoading ? "Loading members..." : "No members match this filter."}</Text>
                  </Table.Td>
                </Table.Tr>
              )}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      </Card>
    </Box>
  );
}
