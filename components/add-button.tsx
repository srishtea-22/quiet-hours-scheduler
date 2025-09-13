"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";
import { DialogFooter, DialogHeader } from "./ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { createClient } from "@/supabase/client";

export function AddButton() {
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const supabase = createClient();
  function calculateDuration(
    startDate: string,
    startTime: string,
    endDate: string,
    endTime: string,
  ) {
    const startDateTime = new Date(`${startDate}T${startTime}`);
    const endDateTime = new Date(`${endDate}T${endTime}`);

    if (endDateTime <= startDateTime) {
      return null;
    }

    const durationMinutes =
      (endDateTime.getTime() - startDateTime.getTime()) / (1000 * 60);
    const hours = Math.floor(durationMinutes / 60);
    const minutes = Math.floor(durationMinutes % 60);
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;

    return days > 0
      ? `${days}d ${remainingHours}h ${minutes}m`
      : `${hours}h ${minutes}m`;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!startDate || !startTime || !endDate || !endTime) {
      toast.error("Please fill in all the details!");
      return;
    }
    const result = calculateDuration(startDate, startTime, endDate, endTime);
    if (!result) {
      toast.error("Quiet hours should end AFTER they start!");
      return;
    }

    const user = await supabase.auth.getUser();
    const { error } = await supabase.from("quiet_hours").insert({
      user_id: user.data.user?.id,
      start_time: new Date(`${startDate}T${startTime}`).toISOString(),
      end_time: new Date(`${endDate}T${endTime}`).toISOString(),
      reminder_sent: false,
    });

    if (error) {
      if (error.code === "23P01") {
        toast.error("An overlapping entry exists!");
      }
      else {
        toast.error(error.message);
      }
      return;
    }

    toast.success("Quiet hours created");

    setStartDate("");
    setStartTime("");
    setEndDate("");
    setEndTime("");
    setIsOpen(false);
  };

  const handleCancel = () => {
    setStartDate("");
    setStartTime("");
    setEndDate("");
    setEndTime("");
    setIsOpen(false);
  };

  const renderDuration = () => {
    if (!startDate || !startTime || !endDate || !endTime) return null;
    const result = calculateDuration(startDate, startTime, endDate, endTime);
    return result ? (
      <div className="text-sm text-muted-foreground">Duration: {result}</div>
    ) : null;
  };
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Add
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Quiet Hours</DialogTitle>
          <DialogDescription>
            Create a new study session by setting your start and end dates &
            times.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-2">
            <div className="grid gap-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="startTime">Start Time</Label>
              <Input
                id="startTime"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="grid gap-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="endTime">End Time</Label>
              <Input
                id="endTime"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>

          {renderDuration()}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Create</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
