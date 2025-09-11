"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";

export function AddButton() {
    const handleAdd = () => {
        toast("hours created");
    }
    return (
        <Button onClick={handleAdd}><Plus/> Add</Button>
    )
}