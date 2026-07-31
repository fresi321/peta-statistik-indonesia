import { createFileRoute } from "@tanstack/react-router";
import { OwnerDashboard } from "@/components/owner/OwnerDashboard";

export const Route = createFileRoute("/owner/")({
  head: () => ({
    meta: [
      { title: "Owner Monitoring · Peta Statistik Indonesia" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: OwnerDashboard,
});
