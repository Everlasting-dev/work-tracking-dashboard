import { DndContext, type DragEndEvent, useDraggable, useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import {
  Avatar,
  Badge,
  Box,
  Card,
  Group,
  Progress,
  SimpleGrid,
  Stack,
  Tabs,
  Text,
  Title,
} from "@mantine/core";
import { useMemo, useState } from "react";
import { useWorkspaceData } from "@/query/workspaceHooks";
import { type UserSummary, type WorkspaceProject, type WorkspaceTask } from "@/lib/workspaceTypes";

type FlowStatus = "available" | "working" | "reviewing" | "blocked" | "away" | "offline";

interface FlowMember {
  user: UserSummary;
  status: FlowStatus;
  currentProject?: WorkspaceProject;
  currentTask?: WorkspaceTask;
  assigned: WorkspaceTask[];
  completed: number;
  progress: number;
  blockerCount: number;
  lastMeaningfulActivity: string;
}

const columns: Array<{ id: FlowStatus; label: string; tone: string }> = [
  { id: "available", label: "Available", tone: "green" },
  { id: "working", label: "Working", tone: "blue" },
  { id: "reviewing", label: "Reviewing", tone: "violet" },
  { id: "blocked", label: "Blocked", tone: "red" },
  { id: "away", label: "Away", tone: "yellow" },
  { id: "offline", label: "Offline", tone: "gray" },
];

function presence(user: UserSummary): "active" | "away" | "offline" {
  if (!user.lastSeenAt) return "offline";
  const age = Date.now() - Date.parse(user.lastSeenAt);
  if (!Number.isFinite(age)) return "offline";
  if (age < 2 * 60_000) return "active";
  if (age < 15 * 60_000) return "away";
  return "offline";
}

function buildFlowMembers(users: UserSummary[], projects: WorkspaceProject[]): FlowMember[] {
  const projectById = new Map(projects.map((project) => [project.id, project]));
  const tasks = projects.flatMap((project) => project.tasks.map((task) => ({ ...task, projectId: project.id })));
  return users.map((user) => {
    const assigned = tasks.filter((task) => task.assigneeId === user.id);
    const open = assigned.filter((task) => task.status !== "done" && task.status !== "completed");
    const completed = assigned.length - open.length;
    const blocked = assigned.filter((task) => task.status === "blocked");
    const reviewing = assigned.find((task) => ["review", "reviewing"].includes(task.status));
    const currentTask = assigned.find((task) => ["doing", "progress", "in-progress"].includes(task.status)) ?? open[0];
    const currentProject = currentTask ? projectById.get(currentTask.projectId) : undefined;
    const seen = presence(user);
    const status: FlowStatus = seen === "offline" ? "offline" : seen === "away" ? "away" : blocked.length ? "blocked" : reviewing ? "reviewing" : currentTask ? "working" : "available";
    const recent = assigned.map((task) => task.updatedAt).filter(Boolean).sort().at(-1) || user.lastSeenAt || "";

    return {
      user,
      status,
      currentProject,
      currentTask,
      assigned,
      completed,
      progress: assigned.length ? Math.round((completed / assigned.length) * 100) : 0,
      blockerCount: blocked.length,
      lastMeaningfulActivity: recent,
    };
  });
}

function DraggableMemberCard({ member }: { member: FlowMember }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `member-${member.user.id}`,
    data: { member },
  });

  return (
    <Card
      ref={setNodeRef}
      withBorder
      radius="sm"
      p="sm"
      style={{ transform: CSS.Translate.toString(transform), opacity: isDragging ? 0.7 : 1 }}
    >
      <Group align="flex-start" wrap="nowrap">
        <Avatar radius="sm" color="green">{member.user.displayName.charAt(0)}</Avatar>
        <Box miw={0} flex={1}>
          <Group gap={6} wrap="nowrap">
            <Text fw={750} truncate>{member.user.displayName}</Text>
            <Badge size="xs" variant="light">{member.user.role || "Member"}</Badge>
          </Group>
          <Text size="xs" c="dimmed" truncate>{member.currentProject?.name ?? member.user.department ?? "No active project"}</Text>
          <Text size="sm" mt={6} truncate>{member.currentTask?.title ?? "Ready for assignment"}</Text>
          <Progress value={member.progress} size="xs" mt="xs" radius="xl" />
          <Group justify="space-between" mt={6}>
            <Text size="xs" c="dimmed">{member.assigned.length} assigned</Text>
            <Text size="xs" c={member.blockerCount ? "red" : "dimmed"}>{member.blockerCount ? `${member.blockerCount} blockers` : "No blockers"}</Text>
          </Group>
        </Box>
        <Badge variant="default" {...listeners} {...attributes} style={{ cursor: "grab" }}>Move</Badge>
      </Group>
    </Card>
  );
}

function FlowColumn({ id, label, tone, members }: { id: FlowStatus; label: string; tone: string; members: FlowMember[] }) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <Card ref={setNodeRef} withBorder radius="sm" p="sm" className={isOver ? "orbit-card-selected" : undefined}>
      <Group justify="space-between" mb="sm">
        <Group gap={6}>
          <Badge color={tone} variant="light">{label}</Badge>
          <Text size="sm" c="dimmed">{members.length}</Text>
        </Group>
      </Group>
      <Stack gap="xs">
        {members.map((member) => <DraggableMemberCard key={member.user.id} member={member} />)}
        {!members.length && <Text size="sm" c="dimmed">No members here.</Text>}
      </Stack>
    </Card>
  );
}

function ProjectRoomsView({ projects }: { projects: WorkspaceProject[] }) {
  return (
    <SimpleGrid cols={{ base: 1, md: 2, xl: 3 }} spacing="md">
      {projects.slice(0, 12).map((project) => (
        <Card key={project.id} withBorder radius="sm">
          <Group justify="space-between" align="flex-start">
            <Box>
              <Text fw={800}>{project.name}</Text>
              <Text size="sm" c="dimmed">{project.department || "General"} · {project.taskCount} tasks</Text>
            </Box>
            <Badge color={project.overdueCount ? "red" : "green"} variant="light">{project.progress}%</Badge>
          </Group>
          <Progress value={project.progress} mt="md" radius="xl" />
          <Group mt="md" gap={6}>
            {project.memberUsers.slice(0, 5).map((member) => <Avatar key={member.id} size="sm" radius="sm">{member.displayName.charAt(0)}</Avatar>)}
            <Text size="sm" c="dimmed">{project.memberUsers.length || 1} member{project.memberUsers.length === 1 ? "" : "s"}</Text>
          </Group>
          <Text size="sm" mt="sm" lineClamp={2}>{project.currentTask?.title ?? "No active task selected"}</Text>
        </Card>
      ))}
    </SimpleGrid>
  );
}

function StaticOrbitView({ project }: { project?: WorkspaceProject }) {
  const members = project?.memberUsers.length ? project.memberUsers : [];
  const points = members.slice(0, 10).map((member, index) => {
    const angle = (index / Math.max(1, members.length)) * Math.PI * 2 - Math.PI / 2;
    return { member, x: 50 + Math.cos(angle) * 34, y: 50 + Math.sin(angle) * 34 };
  });

  return (
    <Card withBorder radius="sm" p="lg" className="static-orbit-card">
      <Box className="static-orbit">
        <svg viewBox="0 0 100 100" aria-hidden="true">
          {points.map((point) => <line key={point.member.id} x1="50" y1="50" x2={point.x} y2={point.y} />)}
        </svg>
        <Box className="static-orbit-center">
          <Text fw={800} ta="center">{project?.name ?? "No project"}</Text>
          <Text size="xs" c="dimmed" ta="center">{project?.progress ?? 0}% complete</Text>
        </Box>
        {points.map((point) => (
          <Box key={point.member.id} className="static-orbit-member" style={{ left: `${point.x}%`, top: `${point.y}%` }}>
            <Avatar radius="sm" size="md">{point.member.displayName.charAt(0)}</Avatar>
            <Text size="xs" ta="center" mt={4}>{point.member.displayName.split(" ")[0]}</Text>
          </Box>
        ))}
      </Box>
    </Card>
  );
}

export function TeamFlowPage() {
  const { data, isLoading, error } = useWorkspaceData();
  const [note, setNote] = useState("");
  const members = useMemo(() => buildFlowMembers(data?.users ?? [], data?.projects ?? []), [data?.projects, data?.users]);
  const activeProject = data?.projects.find((project) => project.status === "active") ?? data?.projects[0];

  const handleDragEnd = (event: DragEndEvent) => {
    const member = event.active.data.current?.member as FlowMember | undefined;
    const destination = event.over?.id ? columns.find((column) => column.id === event.over?.id)?.label : "";
    if (member && destination) {
      setNote(`${member.user.displayName} was inspected for ${destination}. Presence changes require an explicit permitted action.`);
    }
  };

  return (
    <Box className="orbit-page">
      <Group justify="space-between" align="flex-start" mb="lg">
        <Box>
          <Title order={1}>Team</Title>
          <Text c="dimmed">Lightweight team visibility without physics, particles, or permanent animation loops.</Text>
        </Box>
        <Badge variant="light">{members.length} members</Badge>
      </Group>
      {error && <Card withBorder radius="sm" mb="md"><Text c="red">Could not load team data.</Text></Card>}
      {note && <Card withBorder radius="sm" mb="md"><Text size="sm">{note}</Text></Card>}
      <Tabs defaultValue="flow" keepMounted={false}>
        <Tabs.List mb="md">
          <Tabs.Tab value="flow">Team Flow</Tabs.Tab>
          <Tabs.Tab value="rooms">Project Rooms</Tabs.Tab>
          <Tabs.Tab value="orbit">Static Orbit</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="flow">
          {isLoading ? (
            <Text c="dimmed">Loading team flow...</Text>
          ) : (
            <DndContext onDragEnd={handleDragEnd}>
              <SimpleGrid cols={{ base: 1, md: 2, xl: 3 }} spacing="md">
                {columns.map((column) => (
                  <FlowColumn
                    key={column.id}
                    {...column}
                    members={members.filter((member) => member.status === column.id)}
                  />
                ))}
              </SimpleGrid>
            </DndContext>
          )}
        </Tabs.Panel>
        <Tabs.Panel value="rooms">
          <ProjectRoomsView projects={data?.projects ?? []} />
        </Tabs.Panel>
        <Tabs.Panel value="orbit">
          <StaticOrbitView project={activeProject} />
        </Tabs.Panel>
      </Tabs>
    </Box>
  );
}
