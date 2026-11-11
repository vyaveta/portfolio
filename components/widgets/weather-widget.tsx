"use client";

import { useState } from "react";
import { Cloud, CloudDrizzle, CloudRain, MapPin, Sun } from "lucide-react";

type Forecast = { temperature: number; code: number; high: number; low: number; wind: number; humidity: number };

function condition(code: number) {
  if (code === 0) return "Clear sky";
  if ([1, 2].includes(code)) return "Partly cloudy";
  if (code === 3) return "Overcast";
  if ([45, 48].includes(code)) return "Foggy";
  if ([51, 53, 55, 56, 57].includes(code)) return "Drizzle";
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return "Rain";
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "Snow";
  if ([95, 96, 99].includes(code)) return "Thunderstorm";
  return "Current conditions";
}

function ConditionIcon({ code }: { code?: number }) {
  if (code === undefined) return <MapPin size={compactSize()} />;
  if (code === 0) return <Sun size={compactSize()} className="weather-sun" />;
  if ([51, 53, 55, 56, 57].includes(code)) return <CloudDrizzle size={compactSize()} className="weather-cloud" />;
  if ([61, 63, 65, 66, 67, 80, 81, 82, 95, 96, 99].includes(code)) return <CloudRain size={compactSize()} className="weather-cloud" />;
  return <Cloud size={compactSize()} className="weather-cloud" />;
}

function compactSize() { return 34; }

export default function WeatherWidget({ compact = false }: { compact?: boolean }) {
  const [forecast, setForecast] = useState<Forecast | null>(null);
  const [locationLabel, setLocationLabel] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");

  const getWeather = () => {
    if (!navigator.geolocation) { setStatus("error"); return; }
    setStatus("loading");
    navigator.geolocation.getCurrentPosition(async ({ coords }) => {
      try {
        const params = new URLSearchParams({
          latitude: String(coords.latitude),
          longitude: String(coords.longitude),
          current: "temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m",
          daily: "temperature_2m_max,temperature_2m_min",
          forecast_days: "1",
          timezone: "auto",
        });
        const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`);
        if (!response.ok) throw new Error("Weather request failed");
        const data = await response.json();
        setForecast({
          temperature: Math.round(data.current.temperature_2m),
          code: data.current.weather_code,
          high: Math.round(data.daily.temperature_2m_max[0]),
          low: Math.round(data.daily.temperature_2m_min[0]),
          wind: Math.round(data.current.wind_speed_10m),
          humidity: data.current.relative_humidity_2m,
        });
        setLocationLabel("Current location");
        setStatus("idle");
      } catch {
        setStatus("error");
      }
    }, () => setStatus("error"), { timeout: 12000, maximumAge: 300000 });
  };

  return (
    <section className={`widget-card weather-widget${compact ? " compact" : ""}`} aria-label="Weather">
      <header><span>{forecast ? locationLabel : "Weather"}</span><ConditionIcon code={forecast?.code} /></header>
      {forecast ? <>
        <strong className="weather-temperature">{forecast.temperature}°C</strong>
        <p className="weather-condition">{condition(forecast.code)}</p>
        <div className="weather-stats"><span>H:{forecast.high}° L:{forecast.low}°</span><span>💧 {forecast.humidity}%</span><span>↗ {forecast.wind} km/h</span></div>
      </> : <>
        <strong className="weather-placeholder">{status === "loading" ? "…" : "Local forecast"}</strong>
        <p className="weather-condition">{status === "error" ? "Location or forecast unavailable" : "Choose whether to share your location"}</p>
        <button className="weather-locate" onClick={getWeather} disabled={status === "loading"}>{status === "loading" ? "Getting forecast…" : "Use my location"}</button>
      </>}
      <a className="weather-attribution" href="https://open-meteo.com/" target="_blank" rel="noreferrer">Weather by Open-Meteo</a>
    </section>
  );
}
