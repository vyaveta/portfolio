import BatteryWidget from "@/components/widgets/battery-widget";
import CalendarWidget from "@/components/widgets/calendar-widget";
import ClockWidget from "@/components/widgets/clock-widget";
import WeatherWidget from "@/components/widgets/weather-widget";

export default function DesktopWidgets() {
  return (
    <div className="desktop-widget-grid" aria-label="Desktop widgets">
      <CalendarWidget compact />
      <ClockWidget compact />
      <WeatherWidget compact />
      <BatteryWidget compact />
    </div>
  );
}
