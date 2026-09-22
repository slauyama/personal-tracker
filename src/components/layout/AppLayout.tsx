import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import {
  Button,
  Heading,
  NavigationBar,
  NavigationRail,
  type NavItem,
} from "@slauyama/ui";

const NAV_ITEMS: NavItem[] = [
  { value: "/", label: "Home", icon: "home" },
  { value: "/beauty", label: "Beauty", icon: "health_and_beauty" },
  { value: "/dog", label: "Dog", icon: "sound_detection_dog_barking" },
  { value: "/car", label: "Car", icon: "directions_car" },
];

const PAGE_TITLES: Record<string, string> = {
  "/": "Personal Tracker",
  "/beauty": "Beauty Tracker",
  "/dog": "Momo Tracker",
  "/car": "Car Tracker",
};

function activeNavValue(pathname: string): string {
  const match = NAV_ITEMS.find(
    (item) => item.value !== "/" && pathname.startsWith(item.value),
  );
  return match?.value ?? "/";
}

export default function AppLayout() {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const active = activeNavValue(pathname);
  const title = PAGE_TITLES[active] ?? "Personal Tracker";

  return (
    <div className="min-h-screen flex flex-col bg-(--color-surface)">
      <header className="flex items-center justify-between px-4 py-3 border-b border-(--color-outline-variant) sticky top-0 bg-(--color-surface) z-20">
        <Heading as="h1" variant="title-large">
          {title}
        </Heading>
        <div className="flex items-center gap-3">
          {user?.photoURL && (
            <img
              src={user.photoURL}
              alt={user.displayName ?? "User"}
              className="w-8 h-8 rounded-full"
              referrerPolicy="no-referrer"
            />
          )}
          <Button
            variant="text"
            onClick={logout}
            className="text-xs text-(--color-on-surface-variant) hover:underline"
          >
            Sign out
          </Button>
        </div>
      </header>

      <div className="flex-1 flex min-w-0">
        <div className="hidden md:block shrink-0">
          <NavigationRail
            items={NAV_ITEMS}
            value={active}
            align="start"
            onChange={(value) => navigate(value)}
          />
        </div>

        <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6 pb-24 md:pb-6">
          <Outlet />
        </main>
      </div>

      <div className="md:hidden fixed bottom-0 inset-x-0 z-20">
        <NavigationBar
          items={NAV_ITEMS}
          value={active}
          onChange={(value) => navigate(value)}
        />
      </div>
    </div>
  );
}
