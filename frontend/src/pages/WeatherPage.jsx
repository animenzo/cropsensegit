import React, { useState, useEffect } from "react";
import { getCoordinates, getWeather, getWeatherIcon } from "../services/weatherService";
import { FaMapMarkerAlt, FaWind, FaTint, FaSun, FaMoon, FaUmbrella } from "react-icons/fa";
import { WiSunrise, WiSunset } from "react-icons/wi";
// 
const WeatherPage = () => {
  const [city, setCity] = useState("New Delhi"); // Default
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState("");

  const fetchWeather = async (cityName) => {
    setLoading(true);
    const coords = await getCoordinates(cityName);
    if (coords) {
      setCity(coords.name);
      const data = await getWeather(coords.latitude, coords.longitude);
      setWeather(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchWeather("New Delhi");
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim()) fetchWeather(searchInput);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-100 text-emerald-600 animate-pulse font-bold text-xl">Loading Forecast...</div>;
  if (!weather) return <div className="min-h-screen flex items-center justify-center">Failed to load weather.</div>;

  // Formatting Data
  const current = weather.current;
  const daily = weather.daily;
  const weatherInfo = getWeatherIcon(current.weather_code);

  return (
    <div className={`min-h-screen bg-gradient-to-br ${weatherInfo.bg} p-4 md:p-8 transition-all duration-1000`}>
      
      {/* Search & Header */}
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
            <div className="text-white drop-shadow-md text-center md:text-left">
                <h1 className="text-4xl font-black tracking-tight">{city}</h1>
                <p className="text-lg opacity-90 font-medium flex items-center gap-2 justify-center md:justify-start">
                    <FaMapMarkerAlt /> {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric'})}
                </p>
            </div>

            <form onSubmit={handleSearch} className="relative w-full md:w-96">
                <input 
                    type="text" 
                    placeholder="Search city (e.g. Mumbai, Punjab)" 
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="w-full px-6 py-3 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white placeholder-white/70 outline-none focus:bg-white/30 transition-all shadow-lg font-bold"
                />
            </form>
        </div>

        {/* HERO CARD (Current Weather) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Main Stats */}
            <div className="bg-white/30 backdrop-blur-xl rounded-[2.5rem] p-8 md:p-12 text-white shadow-2xl border border-white/20 flex flex-col justify-between relative overflow-hidden group hover:scale-[1.01] transition-transform">
                <div className="z-10">
                    <div className="flex items-center gap-4 mb-2">
                        <span className="bg-white/20 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest">Now</span>
                        <span className="text-sm font-bold opacity-80">{weatherInfo.label}</span>
                    </div>
                    <div className="flex items-start">
                        <span className="text-[8rem] md:text-[10rem] font-black leading-none tracking-tighter">
                            {Math.round(current.temperature_2m)}
                        </span>
                        <span className="text-4xl md:text-6xl font-bold mt-4 md:mt-8">°</span>
                    </div>
                </div>
                
                <div className="z-10 mt-8 grid grid-cols-3 gap-4 text-center">
                    <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
                        <FaWind className="mx-auto text-2xl mb-2 opacity-80" />
                        <p className="text-sm font-bold">{current.wind_speed_10m} <span className="text-[10px] opacity-70">km/h</span></p>
                    </div>
                    <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
                        <FaTint className="mx-auto text-2xl mb-2 opacity-80" />
                        <p className="text-sm font-bold">{current.relative_humidity_2m}%</p>
                    </div>
                    <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
                        <FaUmbrella className="mx-auto text-2xl mb-2 opacity-80" />
                        <p className="text-sm font-bold">{current.precipitation} <span className="text-[10px] opacity-70">mm</span></p>
                    </div>
                </div>

                {/* Decorative Icon Background */}
                <div className="absolute -right-10 -top-10 text-[15rem] opacity-20 pointer-events-none select-none animate-pulse-slow">
                    {weatherInfo.icon}
                </div>
            </div>

            {/* Sun & Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-amber-300 to-orange-400 rounded-[2.5rem] p-8 text-white shadow-xl flex flex-col justify-center items-center relative overflow-hidden">
                    <WiSunrise className="text-8xl relative z-10" />
                    <p className="text-2xl font-bold relative z-10">{new Date(daily.sunrise[0]).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                    <p className="text-sm opacity-80 relative z-10">Sunrise</p>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-3xl"></div>
                </div>
                
                <div className="bg-gradient-to-br from-indigo-400 to-purple-500 rounded-[2.5rem] p-8 text-white shadow-xl flex flex-col justify-center items-center relative overflow-hidden">
                    <WiSunset className="text-8xl relative z-10" />
                    <p className="text-2xl font-bold relative z-10">{new Date(daily.sunset[0]).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                    <p className="text-sm opacity-80 relative z-10">Sunset</p>
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/10 rounded-full blur-3xl"></div>
                </div>
                
                <div className="md:col-span-2 bg-white/40 backdrop-blur-md rounded-[2.5rem] p-8 shadow-lg border border-white/30">
                    <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                        <FaSun className="text-yellow-300" /> UV Index & Advice
                    </h3>
                    <p className="text-white font-medium opacity-90 leading-relaxed">
                        {current.temperature_2m > 30 
                            ? "High heat detected. Ensure irrigation systems are active to prevent crop stress." 
                            : current.precipitation > 0 
                            ? "Rain detected. Consider pausing irrigation to save water."
                            : "Conditions are optimal for field work."}
                    </p>
                </div>
            </div>
        </div>

        {/* 7-DAY FORECAST LIST */}
        <h2 className="text-white text-2xl font-bold mb-6 ml-2 drop-shadow-sm">7-Day Forecast</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {daily.time.map((time, index) => {
                const dayIcon = getWeatherIcon(daily.weather_code[index]);
                const date = new Date(time);
                const isToday = index === 0;

                return (
                    <div key={index} className={`backdrop-blur-md rounded-3xl p-4 flex flex-col items-center justify-between shadow-lg border border-white/10 transition-all hover:-translate-y-2
                        ${isToday ? 'bg-white/40 ring-4 ring-white/20' : 'bg-white/20'}`}>
                        <p className="text-white text-sm font-bold uppercase tracking-wider">
                            {isToday ? 'Today' : date.toLocaleDateString('en-US', { weekday: 'short' })}
                        </p>
                        <div className="text-4xl my-3 drop-shadow-lg">{dayIcon.icon}</div>
                        <div className="text-white text-center">
                            <p className="font-black text-xl">{Math.round(daily.temperature_2m_max[index])}°</p>
                            <p className="text-xs opacity-80 font-medium">{Math.round(daily.temperature_2m_min[index])}°</p>
                        </div>
                        {daily.precipitation_sum[index] > 0 && (
                            <div className="mt-2 flex items-center gap-1 text-[10px] text-blue-100 font-bold bg-blue-500/30 px-2 py-0.5 rounded-full">
                                <FaUmbrella /> {daily.precipitation_sum[index]}mm
                            </div>
                        )}
                    </div>
                );
            })}
        </div>

      </div>
    </div>
  );
};

export default WeatherPage;