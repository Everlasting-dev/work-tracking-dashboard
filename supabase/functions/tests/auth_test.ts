// deno test --allow-env supabase/functions/tests/auth_test.ts
import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { canEdit, isMember, type AuthedUser, type ProjectRow } from "../_shared/auth.ts";

const admin: AuthedUser = { authUid: "a", userId: 1, role: "admin" };
const owner: AuthedUser = { authUid: "o", userId: 2, role: "user" };
const editor: AuthedUser = { authUid: "e", userId: 3, role: "user" };
const stranger: AuthedUser = { authUid: "s", userId: 99, role: "user" };

const project: ProjectRow = { id: 10, owner_id: 2, editor_ids: [3], classroom_id: 5, hidden_from_ids: [] };

Deno.test("canEdit: admin, owner, editor allowed; stranger denied", () => {
  assertEquals(canEdit(admin, project), true);
  assertEquals(canEdit(owner, project), true);
  assertEquals(canEdit(editor, project), true);
  assertEquals(canEdit(stranger, project), false);
  assertEquals(canEdit(stranger, null), false);
});

// Stub service client: classroom membership lookup returns a row for given users.
function svcWithClassroomMembers(memberIds: number[]) {
  return {
    from() {
      return {
        select() { return this; },
        _uid: 0 as number,
        eq(col: string, val: number) { if (col === "user_id") (this as { _uid: number })._uid = val; return this; },
        async maybeSingle() {
          // deno-lint-ignore no-explicit-any
          const uid = (this as any)._uid;
          return { data: memberIds.includes(uid) ? { user_id: uid } : null };
        },
      };
    },
  // deno-lint-ignore no-explicit-any
  } as any;
}

Deno.test("isMember: admin/owner/editor are members", async () => {
  const svc = svcWithClassroomMembers([]);
  assertEquals(await isMember(svc, admin, project), true);
  assertEquals(await isMember(svc, owner, project), true);
  assertEquals(await isMember(svc, editor, project), true);
});

Deno.test("isMember: classroom member allowed; non-member denied", async () => {
  assertEquals(await isMember(svcWithClassroomMembers([99]), stranger, project), true);
  assertEquals(await isMember(svcWithClassroomMembers([]), stranger, project), false);
});

Deno.test("isMember: hidden_from_ids excludes a classroom member", async () => {
  const hidden: ProjectRow = { ...project, hidden_from_ids: [99] };
  assertEquals(await isMember(svcWithClassroomMembers([99]), stranger, hidden), false);
});

Deno.test("isMember: null project is never a member", async () => {
  assertEquals(await isMember(svcWithClassroomMembers([99]), stranger, null), false);
});
