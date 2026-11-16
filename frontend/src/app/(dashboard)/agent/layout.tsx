import type { ReactNode } from "react";

import { DashboardShell } from "@/components/layout/dashboard-shell";

export default function AgentLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <DashboardShell role="agent">
      {children}
    </DashboardShell>
  );
}