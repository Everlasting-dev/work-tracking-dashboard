import { Badge, Box, Card, Group, List, Text, Title } from "@mantine/core";
import { type LucideIcon } from "lucide-react";

export function FoundationPage({
  title,
  description,
  icon: Icon,
  items,
  status = "Foundation",
}: {
  title: string;
  description: string;
  icon: LucideIcon;
  items: string[];
  status?: string;
}) {
  return (
    <Box className="orbit-page">
      <Group justify="space-between" align="flex-start" mb="lg">
        <Box>
          <Title order={1}>{title}</Title>
          <Text c="dimmed" maw={720}>{description}</Text>
        </Box>
        <Badge variant="light">{status}</Badge>
      </Group>
      <Card withBorder radius="sm">
        <Group align="flex-start" gap="md">
          <Box className="orbit-page-icon"><Icon size={20} /></Box>
          <Box>
            <Text fw={800} mb="xs">Migration scope</Text>
            <List spacing="xs" c="dimmed">
              {items.map((item) => <List.Item key={item}>{item}</List.Item>)}
            </List>
          </Box>
        </Group>
      </Card>
    </Box>
  );
}
