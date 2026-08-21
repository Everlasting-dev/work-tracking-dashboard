import { describe, expect, it } from "vitest";
import {
  canEditProject,
  canMoveTask,
  canReadFile,
  canReadProject,
  compactSyncQueue,
  isSessionUsable,
  reorderIds,
  reportSummary,
  type RuleProject,
} from "@/lib/workspaceRules";

const project: RuleProject = {
  id: 10,
  ownerId: 1,
  editorIds: [2],
  hiddenFromIds: [4],
  classroomId: 7,
  status: "active",
  createdAt: "2026-08-03T10:00:00Z",
  updatedAt: "2026-08-05T10:00:00Z",
};

describe("auth/session rules", () => {
  it("requires a user id or admin role", () => {
    expect(isSessionUsable(null)).toBe(false);
    expect(isSessionUsable({ id: null, role: "user" })).toBe(false);
    expect(isSessionUsable({ id: null, role: "admin" })).toBe(true);
    expect(isSessionUsable({ id: 1, role: "user" })).toBe(true);
  });
});

describe("project permissions", () => {
  it("allows owners, editors, classroom members, and admins to read", () => {
    expect(canReadProject({ id: 1, role: "user" }, project)).toBe(true);
    expect(canReadProject({ id: 2, role: "user" }, project)).toBe(true);
    expect(canReadProject({ id: 3, role: "user" }, project, [7])).toBe(true);
    expect(canReadProject({ id: 5, role: "admin" }, project)).toBe(true);
  });

  it("blocks hidden classroom users and non-members", () => {
    expect(canReadProject({ id: 4, role: "user" }, project, [7])).toBe(false);
    expect(canReadProject({ id: 8, role: "user" }, project)).toBe(false);
  });

  it("allows only owners, editors, and admins to edit", () => {
    expect(canEditProject({ id: 1, role: "user" }, project)).toBe(true);
    expect(canEditProject({ id: 2, role: "user" }, project)).toBe(true);
    expect(canEditProject({ id: 3, role: "user" }, project)).toBe(false);
    expect(canEditProject({ id: 9, role: "admin" }, project)).toBe(true);
  });
});

describe("task rules", () => {
  it("requires edit access and a known status transition", () => {
    expect(canMoveTask({ id: 2, role: "user" }, project, { id: 100, projectId: 10, status: "todo" }, "doing")).toBe(true);
    expect(canMoveTask({ id: 3, role: "user" }, project, { id: 100, projectId: 10, status: "todo" }, "doing")).toBe(false);
    expect(canMoveTask({ id: 2, role: "user" }, project, { id: 100, projectId: 10, status: "todo" }, "blocked")).toBe(false);
  });

  it("reorders ids without duplicates", () => {
    expect(reorderIds([1, 2, 3, 4], 4, 2)).toEqual([1, 4, 2, 3]);
    expect(reorderIds([1, 2, 3], 1, null)).toEqual([2, 3, 1]);
  });
});

describe("file permissions", () => {
  it("requires readable project membership and non-deleted files", () => {
    expect(canReadFile({ id: 3, role: "user" }, project, { id: "f1", projectId: 10 }, [7])).toBe(true);
    expect(canReadFile({ id: 3, role: "user" }, project, { id: "f1", projectId: 10, deletedAt: "2026-08-10" }, [7])).toBe(false);
    expect(canReadFile({ id: 3, role: "user" }, project, { id: "f1", projectId: 99 }, [7])).toBe(false);
  });
});

describe("sync queue", () => {
  it("keeps only the newest operation per entity", () => {
    expect(
      compactSyncQueue([
        { id: "1", entity: "task", entityId: 5, op: "update", updatedAt: "2026-08-01T10:00:00Z" },
        { id: "2", entity: "project", entityId: 2, op: "update", updatedAt: "2026-08-01T09:00:00Z" },
        { id: "3", entity: "task", entityId: 5, op: "delete", updatedAt: "2026-08-01T11:00:00Z" },
      ]),
    ).toEqual([
      { id: "2", entity: "project", entityId: 2, op: "update", updatedAt: "2026-08-01T09:00:00Z" },
      { id: "3", entity: "task", entityId: 5, op: "delete", updatedAt: "2026-08-01T11:00:00Z" },
    ]);
  });
});

describe("reporting", () => {
  it("summarizes started and completed projects in the selected month", () => {
    expect(
      reportSummary(
        [
          project,
          { ...project, id: 11, status: "completed", createdAt: "2026-07-01T00:00:00Z", updatedAt: "2026-08-20T00:00:00Z" },
          { ...project, id: 12, status: "completed", createdAt: "2026-08-12T00:00:00Z", completedAt: "2026-09-01T00:00:00Z" },
        ],
        "2026-08",
      ),
    ).toEqual({ month: "2026-08", total: 3, started: 2, completed: 1 });
  });
});
