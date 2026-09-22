import { Button, Icon, Text } from "@slauyama/ui";
import { useNavigate } from "react-router-dom";

const SECTIONS = [
  { to: "/beauty", label: "Beauty", icon: "health_and_beauty" },
  { to: "/dog", label: "Dog", icon: "sound_detection_dog_barking" },
  { to: "/car", label: "Car", icon: "directions_car" },
];

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8">
      <div className="grid grid-cols-3 gap-4 w-full max-w-lg">
        {SECTIONS.map(({ to, label, icon }) => (
          <Button
            variant="elevated"
            key={to}
            onClick={() => navigate(to)}
            className="aspect-square h-40 flex flex-col items-center justify-center rounded-2xl transition-all cursor-pointer group"
          >
            <Icon name={icon} size={40} />
            <Text variant="body-medium"> {label}</Text>
          </Button>
        ))}
      </div>

      <Text variant="body-small">v{__APP_VERSION__}</Text>
    </div>
  );
}
