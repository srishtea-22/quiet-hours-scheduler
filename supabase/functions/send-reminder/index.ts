import "@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const resendApiKey = Deno.env.get("RESEND_API_KEY")!;

if (!supabaseUrl || !supabaseServiceRoleKey || !resendApiKey) {
  throw new Error("Missing environment variables");
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: { persistSession: false },
});

const resend = new Resend(resendApiKey);

Deno.serve(async () => {
  try {
    const now = new Date();
    const tenMinutesFromNow = new Date(now.getTime() + 10 * 60 * 1000);

    const { data: quietHours, error } = await supabase
      .from("quiet_hours")
      .select("id, user_id, start_time")
      .gte("start_time", now.toISOString())
      .lte("start_time", tenMinutesFromNow.toISOString())
      .eq("reminder_sent", false)
      .limit(500);

    if (error) throw error;
    if (!quietHours || quietHours.length === 0) {
      return new Response(
        JSON.stringify({ message: "No reminders to send." }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    const results = [];

    for (const block of quietHours) {
      try {
        const { data: userData, error: userError } = await supabase.auth.admin.getUserById(block.user_id);
        const email = userData?.user?.email;

        if (userError || !email) {
          console.error(`No email found for user_id: ${block.user_id}`, userError);
          results.push({ block_id: block.id, success: false, error: userError ?? "No email" });
          continue;
        }

        const startTime = new Date(block.start_time).toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          timeZoneName: "short",
        });

        const emailResult = await resend.emails.send({
          from: "Quiet Hours <onboarding@resend.dev>",
          to: email,
          subject: "Quiet Hours Reminder: Your study block starts soon!",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #333;">📖 Quiet Hours Reminder</h2>
              <p style="font-size: 16px; color: #555;">
                Your quiet study block is starting at <strong>${startTime}</strong>. Get ready to focus!
              </p>
              <p style="font-size: 14px; color: #777;">
                Silence notifications and prepare your study materials.
              </p>
            </div>
          `,
        });

        if (emailResult.error) {
          console.error(`Failed to send email to ${email}:`, emailResult.error);
          results.push({ block_id: block.id, success: false, error: emailResult.error });
          continue;
        }

        const { error: updateError } = await supabase
          .from("quiet_hours")
          .update({ reminder_sent: true })
          .eq("id", block.id);

        if (updateError) {
          console.error(`Failed to update block ${block.id}:`, updateError);
          results.push({ block_id: block.id, success: false, error: updateError });
        } else {
          console.log(`Successfully sent reminder and updated block ${block.id}`);
          results.push({ block_id: block.id, success: true });
        }
      } catch (blockError) {
        console.error(`Error processing block ${block.id}:`, blockError);
        results.push({ block_id: block.id, success: false });
      }
    }

    const successCount = results.filter((r) => r.success).length;
    const failureCount = results.filter((r) => !r.success).length;

    return new Response(
      JSON.stringify({
        message: `Processed ${quietHours.length} reminders. ${successCount} successful, ${failureCount} failed.`,
        results,
        timestamp: now.toISOString(),
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Edge Function error:", err);
    return new Response(
      JSON.stringify({ error: "Internal Server Error", timestamp: new Date().toISOString() }),
      { headers: { "Content-Type": "application/json" }, status: 500 }
    );
  }
});
