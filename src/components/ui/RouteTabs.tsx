import { useLocation, useNavigate } from "react-router-dom";
import { TabDef, Tabs } from "@slauyama/ui";

interface RouteTabsProps {
  tabs: TabDef[];
  className?: string;
}

export default function RouteTabs({ tabs, className }: RouteTabsProps) {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const active = tabs
    .filter(
      (tab) => pathname === tab.value || pathname.startsWith(`${tab.value}/`),
    )
    .sort((a, b) => b.value.length - a.value.length)[0];

  return (
    <Tabs
      tabs={tabs.map((tab) => ({
        value: tab.value,
        icon: tab?.icon,
        label: tab.label,
      }))}
      value={active?.value}
      onChange={(to) => navigate(to)}
      className={className}
    />
  );
}
