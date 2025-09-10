import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export default async function ProtectedPage() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) {
    redirect("/auth/login");
  }

  return (
    <div className="flex-1 w-full flex flex-col gap-12">
      <div className="w-full">
      </div>
      <div>
        <h2 className="font-bold text-2xl mb-4">Upcoming quiet hours</h2>
        <h2 className="font-bold text-2xl mb-4 mt-8">Recent Activity</h2>
      </div>
    </div>
  );
}
