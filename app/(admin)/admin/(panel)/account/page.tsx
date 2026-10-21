import type { Metadata } from "next";
import { Suspense } from "react";
import { ChangePasswordForm } from "@/components/admin/AuthForms";
import { panel } from "@/components/admin/styles";
import { requireStaff } from "@/lib/admin-auth";
import { adminLogOut } from "@/lib/admin-actions";

export const metadata: Metadata = {
  title: "Your admin account",
};

export default function AccountPage() {
  return (
    <main className="px-4 py-6 sm:px-8 sm:py-7">
      <h1 className="font-serif text-[38px] leading-none">You</h1>
      <Suspense>
        <Account />
      </Suspense>
    </main>
  );
}

async function Account() {
  const staff = await requireStaff();
  return (
    <div className={`${panel} mt-6 max-w-xl p-6`}>
      <p className="font-medium">{staff.name}</p>
      <p className="text-sm text-rose">
        {staff.email} · {staff.role === "owner" ? "Owner" : "Helper"}
      </p>
      <h2 className="mt-6 font-medium">Change your password</h2>
      <ChangePasswordForm />
      <form action={adminLogOut} className="mt-8 border-t border-seam pt-5">
        <button type="submit" className="cursor-pointer text-sm text-rose underline underline-offset-4 hover:text-cherry">
          Log out
        </button>
      </form>
    </div>
  );
}
