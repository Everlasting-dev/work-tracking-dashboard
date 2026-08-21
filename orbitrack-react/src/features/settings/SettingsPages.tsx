import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Card,
  Checkbox,
  CopyButton,
  FileButton,
  Group,
  Kbd,
  SimpleGrid,
  Stack,
  Switch,
  Table,
  Text,
  TextInput,
  Title,
  Tooltip,
} from "@mantine/core";
import { Link } from "@tanstack/react-router";
import { Check, Download, RotateCcw, Search, Upload, X } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import { settingsSections } from "@/features/settings/settingsModel";
import { settingsNavItems } from "@/navigation/navItems";
import { shortcutConflicts, shortcutDefinitions, shortcutLabel, shortcutPreference } from "@/shortcuts/registry";
import { useUiStore, type PerformanceMode } from "@/stores/uiStore";

function PageFrame({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return (
    <Box className="orbit-page">
      <Group justify="space-between" align="flex-start" mb="lg">
        <Box>
          <Title order={1}>{title}</Title>
          <Text c="dimmed" maw={760}>{description}</Text>
        </Box>
      </Group>
      {children}
    </Box>
  );
}

export function SettingsHomePage() {
  return (
    <PageFrame title="Settings" description="A single, calmer control room for Orbitrack preferences, navigation, shortcuts, notifications, performance, and account settings.">
      <SimpleGrid cols={{ base: 1, sm: 2, xl: 3 }} spacing="md">
        {settingsSections.map((section) => {
          const route = settingsNavItems.find((item) => item.to.endsWith(section.slug));
          return (
            <Card key={section.slug} component={Link} to={route?.to ?? "/settings"} withBorder radius="sm" className="orbit-card-link">
              <Group justify="space-between" align="flex-start">
                <Box>
                  <Text fw={750}>{section.title}</Text>
                  <Text size="sm" c="dimmed" mt={4}>{section.description}</Text>
                </Box>
                <Badge variant="light">{section.items.length}</Badge>
              </Group>
              <Group gap={6} mt="md">
                {section.items.slice(0, 4).map((item) => <Badge key={item} variant="default" radius="sm">{item}</Badge>)}
              </Group>
            </Card>
          );
        })}
      </SimpleGrid>
    </PageFrame>
  );
}

export function GenericSettingsPage({ slug }: { slug: string }) {
  const section = settingsSections.find((item) => item.slug === slug) ?? settingsSections[0];
  return (
    <PageFrame title={section.title} description={section.description}>
      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
        {section.items.map((item) => (
          <Card key={item} withBorder radius="sm">
            <Group justify="space-between">
              <Box>
                <Text fw={700}>{item}</Text>
                <Text size="sm" c="dimmed">Foundation setting. Persistence is wired through user preferences in the migration plan.</Text>
              </Box>
              <Switch disabled aria-label={`${item} toggle`} />
            </Group>
          </Card>
        ))}
      </SimpleGrid>
    </PageFrame>
  );
}

export function PerformanceSettingsPage() {
  const performanceMode = useUiStore((state) => state.performanceMode);
  const setPerformanceMode = useUiStore((state) => state.setPerformanceMode);
  const reducedMotion = useUiStore((state) => state.reducedMotion);
  const setReducedMotion = useUiStore((state) => state.setReducedMotion);
  const blurEffects = useUiStore((state) => state.blurEffects);
  const setBlurEffects = useUiStore((state) => state.setBlurEffects);
  const routePreloading = useUiStore((state) => state.routePreloading);
  const setRoutePreloading = useUiStore((state) => state.setRoutePreloading);
  const realtimeEnabled = useUiStore((state) => state.realtimeEnabled);
  const setRealtimeEnabled = useUiStore((state) => state.setRealtimeEnabled);

  const modes: Array<{ id: PerformanceMode; title: string; copy: string }> = [
    { id: "full", title: "Full", copy: "Short transitions, richer effects, normal realtime, and route preloading." },
    { id: "balanced", title: "Balanced", copy: "Reduced effects, moderate cache freshness, and restrained preloading." },
    { id: "low-power", title: "Low Power", copy: "No decorative animation, no blur, slower refresh, and minimal realtime." },
  ];

  return (
    <PageFrame title="Performance" description="Choose how much visual and network activity Orbitrack should use on this device.">
      <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md" mb="lg">
        {modes.map((mode) => (
          <Card key={mode.id} withBorder radius="sm" className={performanceMode === mode.id ? "orbit-card-selected" : undefined}>
            <Group justify="space-between" align="flex-start">
              <Box>
                <Text fw={800}>{mode.title}</Text>
                <Text size="sm" c="dimmed" mt={4}>{mode.copy}</Text>
              </Box>
              {performanceMode === mode.id && <Badge color="green">Active</Badge>}
            </Group>
            <Button fullWidth mt="md" variant={performanceMode === mode.id ? "filled" : "default"} onClick={() => setPerformanceMode(mode.id)}>
              Use {mode.title}
            </Button>
          </Card>
        ))}
      </SimpleGrid>
      <Card withBorder radius="sm">
        <Stack>
          <Switch label="Reduced motion" description="Disable decorative animations and SVG path motion." checked={reducedMotion} onChange={(event) => setReducedMotion(event.currentTarget.checked)} />
          <Switch label="Blur effects" description="Allow translucent blur surfaces in the shell." checked={blurEffects} onChange={(event) => setBlurEffects(event.currentTarget.checked)} />
          <Switch label="Route preloading" description="Preload likely destinations when hovering navigation items." checked={routePreloading} onChange={(event) => setRoutePreloading(event.currentTarget.checked)} />
          <Switch label="Realtime updates" description="Keep critical Supabase realtime subscriptions open while the app is visible." checked={realtimeEnabled} onChange={(event) => setRealtimeEnabled(event.currentTarget.checked)} />
        </Stack>
      </Card>
    </PageFrame>
  );
}

export function ShortcutsSettingsPage() {
  const overrides = useUiStore((state) => state.shortcutOverrides);
  const setShortcutOverride = useUiStore((state) => state.setShortcutOverride);
  const resetShortcut = useUiStore((state) => state.resetShortcut);
  const resetAllShortcuts = useUiStore((state) => state.resetAllShortcuts);
  const [search, setSearch] = useState("");
  const conflicts = shortcutConflicts(overrides);

  const rows = useMemo(
    () =>
      shortcutDefinitions.filter((shortcut) => {
        const haystack = `${shortcut.category} ${shortcut.action} ${shortcut.description}`.toLowerCase();
        return haystack.includes(search.trim().toLowerCase());
      }),
    [search],
  );

  const importShortcuts = async (file: File | null) => {
    if (!file) return;
    const text = await file.text();
    const parsed = JSON.parse(text) as Record<string, { keys: string[]; enabled: boolean }>;
    for (const [id, preference] of Object.entries(parsed)) {
      if (shortcutDefinitions.some((definition) => definition.id === id)) {
        setShortcutOverride(id, preference);
      }
    }
  };

  return (
    <PageFrame title="Shortcuts" description="View, customize, disable, export, and import Orbitrack keyboard shortcuts. Sequential shortcuts never fire while typing in fields or editors.">
      <Group justify="space-between" mb="md">
        <TextInput value={search} onChange={(event) => setSearch(event.currentTarget.value)} leftSection={<Search size={15} />} placeholder="Search shortcuts" w={{ base: "100%", sm: 320 }} />
        <Group gap="xs">
          <CopyButton value={JSON.stringify(overrides, null, 2)}>
            {({ copied, copy }) => (
              <Button variant="default" leftSection={copied ? <Check size={14} /> : <Download size={14} />} onClick={copy}>
                {copied ? "Copied" : "Export"}
              </Button>
            )}
          </CopyButton>
          <FileButton onChange={(file) => void importShortcuts(file)} accept="application/json">
            {(props) => <Button {...props} variant="default" leftSection={<Upload size={14} />}>Import</Button>}
          </FileButton>
          <Button variant="default" leftSection={<RotateCcw size={14} />} onClick={resetAllShortcuts}>Restore all</Button>
        </Group>
      </Group>
      <Card withBorder radius="sm" p={0}>
        <Table.ScrollContainer minWidth={860}>
          <Table verticalSpacing="sm" highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Action</Table.Th>
                <Table.Th>Shortcut</Table.Th>
                <Table.Th>Category</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th ta="right">Controls</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {rows.map((shortcut) => {
                const preference = shortcutPreference(shortcut, overrides);
                const hasConflict = conflicts.has(shortcut.id);
                return (
                  <Table.Tr key={shortcut.id}>
                    <Table.Td>
                      <Text fw={700}>{shortcut.action}</Text>
                      <Text size="sm" c="dimmed">{shortcut.description}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Group gap={5}>
                        {preference.keys.map((key) => <Kbd key={key}>{shortcutLabel([key])}</Kbd>)}
                      </Group>
                    </Table.Td>
                    <Table.Td><Badge variant="light">{shortcut.category}</Badge></Table.Td>
                    <Table.Td>
                      <Group gap="xs">
                        <Checkbox
                          checked={preference.enabled}
                          aria-label={`Enable ${shortcut.action}`}
                          onChange={(event) => setShortcutOverride(shortcut.id, { ...preference, enabled: event.currentTarget.checked })}
                        />
                        {hasConflict ? <Badge color="red" leftSection={<X size={12} />}>Conflict</Badge> : <Badge color="green" variant="light">Ready</Badge>}
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      <Group justify="flex-end" gap="xs">
                        <Tooltip label="Edit shortcut">
                          <ActionIcon
                            variant="default"
                            aria-label={`Edit ${shortcut.action}`}
                            onClick={() => {
                              const next = window.prompt("Shortcut keys, separated by comma", preference.keys.join(", "));
                              if (next != null) {
                                setShortcutOverride(shortcut.id, { ...preference, keys: next.split(",").map((item) => item.trim()).filter(Boolean) });
                              }
                            }}
                          >
                            <Kbd size="xs">I</Kbd>
                          </ActionIcon>
                        </Tooltip>
                        <Tooltip label="Reset shortcut">
                          <ActionIcon variant="default" aria-label={`Reset ${shortcut.action}`} onClick={() => resetShortcut(shortcut.id)}>
                            <RotateCcw size={14} />
                          </ActionIcon>
                        </Tooltip>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                );
              })}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      </Card>
    </PageFrame>
  );
}
