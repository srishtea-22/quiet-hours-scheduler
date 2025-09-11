import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export async function Hero() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;
  return (
    <div className="flex flex-col gap-16 items-center">
      <div className="text-3xl lg:text-4xl flex gap-8 justify-center items-center">
        QUIET
        <span className="border-l rotate-45 h-7" />
        HOURS
      </div>
      <h1 className="sr-only">Quiet Hours</h1>
      <p className="text-xl lg:text-2xl !leading-tight mx-auto max-w-xl text-center">
        Schedule your quiet hours, block distractions, and get reminded right before it’s time to focus.
      </p>
      <Link href={user ? "/protected" : "/auth/sign-up"}>
      <Button>Get Started</Button>
      </Link>
      <div className="w-full p-[1px] bg-gradient-to-r from-transparent via-foreground/10 to-transparent my-8" />
    </div>
  );
}
