import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { InfoIcon } from "lucide-react";
import { QuietHoursTable } from "@/components/quiet_hours_table";
import { AddButton } from "@/components/add-button";

export default async function ProtectedPage() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) {
    redirect("/auth/login");
  }
  const { data: quiet_hours } = await supabase.from("quiet_hours").select();

  return (
    <div className="flex-1 w-full flex flex-col gap-12">
      <div className="w-full flex items-center gap-2">
        <AddButton />
        <div className="bg-accent text-sm p-2.5 px-5 rounded-md text-foreground flex gap-3 items-center">
          <InfoIcon size="16" strokeWidth={2} />
          You’ll receive an email 10 minutes before your quiet hours begin.
        </div>
      </div>
      <div>
        <h2 className="font-bold text-2xl mb-4">Your Quiet Hours</h2>
        <div>
          <QuietHoursTable blocks={quiet_hours ?? []}/>
        </div>
      </div>
    </div>
  );
}
