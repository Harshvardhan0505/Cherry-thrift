import type { Metadata } from "next";
import { Suspense } from "react";
import { AddHelperForm, HelperActions } from "@/components/admin/PeopleControls";
import { panel, sectionTitle } from "@/components/admin/styles";
import { requireStaff } from "@/lib/admin-auth";
import { listTeam } from "@/lib/admin-data";
import { dateOf } from "@/lib/admin-format";

export const metadata: Metadata = {
  title: "Admin team",
};

export default function AdminTeamPage() {
  return (
    <main className="px-4 py-5 sm:px-8 sm:py-7">
      <h1 className="font-serif text-[38px] leading-none">Team</h1>
      <p className="mt-2 max-w-xl text-sm text-rose">
        Helpers can manage orders: statuses, payments, tracking and notes. Only you can see this page, add or remove
        helpers, and reset customers&apos; passwords.
      </p>
      <Suspense fallback={<p className="py-20 text-center text-rose">Loading team…</p>}>
        <Team />
      </Suspense>
    </main>
  );
}

async function Team() {
  const owner = await requireStaff("owner");
  const team = await listTeam();
  return (
    <div className="mt-6 grid max-w-3xl gap-5">
      <ul className={`${panel} divide-y divide-seam`}>
        {team.map((member) => (
          <li key={member.id} className="flex flex-wrap items-start gap-x-6 gap-y-3 px-4 py-4 sm:px-5">
            <div className="min-w-0 flex-1 basis-56">
              <p className="font-medium">
                {member.name}
                {member.id === owner.id && <span className="text-rose"> (you)</span>}
              </p>
              <p className="text-[13px] text-rose">{member.email}</p>
              <p className="mt-0.5 text-xs text-rose">
                {member.role === "owner" ? "Owner" : "Helper"} · added {dateOf(member.joined)}
              </p>
            </div>
            {member.role === "helper" && <HelperActions staffId={member.id} name={member.name} />}
          </li>
        ))}
      </ul>
      <section className={`${panel} p-5`}>
        <h2 className={sectionTitle}>Add a helper</h2>
        <div className="mt-3">
          <AddHelperForm />
        </div>
      </section>
    </div>
  );
}
