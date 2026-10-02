import { useLocation, useNavigate } from "react-router-dom";
import { TabDef, Tabs } from "@slauyama/ui";
import { navigateWithTransition } from "../../lib/navTransition";

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

  function goTo(to: string) {
    const from = tabs.findIndex((tab) => tab.value === active?.value);
    const target = tabs.findIndex((tab) => tab.value === to);
    navigateWithTransition(
      target < from ? "slide-back" : "slide-forward",
      () => navigate(to),
    );
  }

  return (
    <Tabs
      tabs={tabs.map((tab) => ({
        value: tab.value,
        icon: tab?.icon,
        label: tab.label,
      }))}
      value={active?.value}
      onChange={goTo}
      className={`[view-transition-name:section-tabs] ${className ?? ""}`}
    />
  );
}
