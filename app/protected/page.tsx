"use client";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { InfoIcon } from "lucide-react";
import { QuietHoursTable } from "@/components/quiet_hours_table";
import { AddButton } from "@/components/add-button";
import { useEffect, useState } from "react";

export interface QuietHour {
  id: string;
  user_id: string;
  start_time: string;
  end_time: string;
  reminder_sent: boolean;
  created_at?: string;
  updated_at?: string;
}

export default function ProtectedPage() {
  const [quietHours, setQuietHours] = useState<QuietHour[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchQuietHours = async () => {
    const { data } = await supabase.from("quiet_hours").select();
    setQuietHours(data ?? []);
  };

  useEffect(() => {
    const checkAuthAndFetchData = async () => {
      const { data, error } = await supabase.auth.getClaims();
      if (error || !data?.claims) {
        redirect("/auth/login");
        return;
      }
      
      await fetchQuietHours();
      setLoading(false);
    };

    checkAuthAndFetchData();
  }, []);

  const handleQuietHoursAdded = () => {
    fetchQuietHours();
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex-1 w-full flex flex-col gap-12">
      <div className="w-full flex items-center gap-2">
        <AddButton onQuietHoursAdded={handleQuietHoursAdded} />
        <div className="bg-accent text-sm p-2.5 px-5 rounded-md text-foreground flex gap-3 items-center">
          <InfoIcon size="16" strokeWidth={2} />
          You&apos;ll receive an email 10 minutes before your quiet hours begin.
        </div>
      </div>
      <div>
        <h2 className="font-bold text-2xl mb-4">Your Quiet Hours</h2>
        <div>
          <QuietHoursTable blocks={quietHours} />
        </div>
      </div>
    </div>
  );
}