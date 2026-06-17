"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import {
  Moon, Sun, Monitor, Bell, Shield, Palette,
  ChevronRight, Check, Globe, Volume2, Eye,
} from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

type ThemeOption = "dark" | "light" | "system";

const THEME_OPTIONS: Array<{ value: ThemeOption; label: string; desc: string; icon: React.ReactNode }> = [
  {
    value: "dark",
    label: "Dark",
    desc: "Easy on the eyes. Best for trading.",
    icon: <Moon className="w-5 h-5" />,
  },
  {
    value: "light",
    label: "Light",
    desc: "Clean and minimal.",
    icon: <Sun className="w-5 h-5" />,
  },
  {
    value: "system",
    label: "System",
    desc: "Follows your OS preference.",
    icon: <Monitor className="w-5 h-5" />,
  },
];

function SectionHeader({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="flex items-start gap-3 mb-4">
      <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
        {icon}
      </div>
      <div>
        <h2 className="text-sm font-semibold text-white">{title}</h2>
        <p className="text-xs text-zinc-600 mt-0.5">{desc}</p>
      </div>
    </div>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={cn(
        "relative w-10 h-5.5 rounded-full transition-colors duration-200 shrink-0",
        checked ? "bg-indigo-600" : "bg-zinc-800"
      )}
      style={{ height: "22px" }}
    >
      <span
        className={cn(
          "absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200",
          checked && "translate-x-[18px]"
        )}
      />
    </button>
  );
}

function SettingRow({
  label,
  desc,
  children,
}: {
  label: string;
  desc?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between py-3.5 border-b border-[#1e2130] last:border-0">
      <div>
        <p className="text-sm font-medium text-zinc-200">{label}</p>
        {desc && <p className="text-xs text-zinc-600 mt-0.5">{desc}</p>}
      </div>
      <div className="ml-4 shrink-0">{children}</div>
    </div>
  );
}

export default function SettingsPage() {
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const [selectedTheme, setSelectedTheme] = useState<ThemeOption>(theme);

  // Notification toggles
  const [notifLikes, setNotifLikes] = useState(true);
  const [notifComments, setNotifComments] = useState(true);
  const [notifFollows, setNotifFollows] = useState(false);
  const [notifNewsletter, setNotifNewsletter] = useState(false);

  // Display toggles
  const [showPrices, setShowPrices] = useState(true);
  const [compactCards, setCompactCards] = useState(false);
  const [animatePrices, setAnimatePrices] = useState(true);

  function applyTheme(v: ThemeOption) {
    setSelectedTheme(v);
    if (v === "system") {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setTheme(prefersDark ? "dark" : "light");
    } else {
      setTheme(v);
    }
    toast.success(`Theme set to ${v}`);
  }

  function saveProfile() {
    toast.success("Settings saved");
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-xl font-bold text-white">Settings</h1>
        <p className="text-sm text-zinc-600 mt-0.5">Manage your preferences and account</p>
      </div>

      <div className="space-y-6">
        {/* Appearance */}
        <div className="card p-5">
          <SectionHeader
            icon={<Palette className="w-4 h-4" />}
            title="Appearance"
            desc="Customise how Tickr looks on your device"
          />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {THEME_OPTIONS.map(({ value, label, desc, icon }) => {
              const active = selectedTheme === value;
              return (
                <button
                  key={value}
                  onClick={() => applyTheme(value)}
                  className={cn(
                    "relative flex flex-col items-center gap-2.5 p-4 rounded-xl border transition-all text-center",
                    active
                      ? "border-indigo-500/60 bg-indigo-500/8 text-indigo-300"
                      : "border-[#1e2130] bg-[#0a0c13] text-zinc-500 hover:border-[#2d3148] hover:text-zinc-300"
                  )}
                >
                  {active && (
                    <span className="absolute top-2 right-2 w-4 h-4 bg-indigo-500 rounded-full flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 text-white" />
                    </span>
                  )}
                  <span className={active ? "text-indigo-400" : ""}>{icon}</span>
                  <div>
                    <p className="text-xs font-semibold">{label}</p>
                    <p className="text-[10px] text-zinc-600 mt-0.5 leading-tight">{desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Display */}
        <div className="card p-5">
          <SectionHeader
            icon={<Eye className="w-4 h-4" />}
            title="Display"
            desc="Control what's shown in your feed"
          />
          <div>
            <SettingRow label="Show live prices in sidebar" desc="Animate real-time price updates">
              <Toggle checked={showPrices} onChange={setShowPrices} />
            </SettingRow>
            <SettingRow label="Animate price changes" desc="Flash green/red on price movement">
              <Toggle checked={animatePrices} onChange={setAnimatePrices} />
            </SettingRow>
            <SettingRow label="Compact card view" desc="Reduce card height to show more posts">
              <Toggle checked={compactCards} onChange={setCompactCards} />
            </SettingRow>
          </div>
        </div>

        {/* Notifications */}
        <div className="card p-5">
          <SectionHeader
            icon={<Bell className="w-4 h-4" />}
            title="Notifications"
            desc="Choose what updates you want to receive"
          />
          <div>
            <SettingRow label="Likes on your posts" desc="When someone likes one of your setups">
              <Toggle checked={notifLikes} onChange={setNotifLikes} />
            </SettingRow>
            <SettingRow label="Comments" desc="When someone comments on your setup">
              <Toggle checked={notifComments} onChange={setNotifComments} />
            </SettingRow>
            <SettingRow label="New followers" desc="When someone starts following you">
              <Toggle checked={notifFollows} onChange={setNotifFollows} />
            </SettingRow>
            <SettingRow label="Weekly digest" desc="Weekly summary of top setups">
              <Toggle checked={notifNewsletter} onChange={setNotifNewsletter} />
            </SettingRow>
          </div>
        </div>

        {/* Account */}
        {session && (
          <div className="card p-5">
            <SectionHeader
              icon={<Shield className="w-4 h-4" />}
              title="Account"
              desc="Your account details and security"
            />
            <div>
              <SettingRow label="Username">
                <span className="text-sm font-mono text-zinc-400">@{session.user.username}</span>
              </SettingRow>
              <SettingRow label="Email">
                <span className="text-sm text-zinc-400">{session.user.email}</span>
              </SettingRow>
              <SettingRow label="Change password" desc="Update your login credentials">
                <button
                  onClick={() => toast("Password change coming soon", { icon: "🔒" })}
                  className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 transition-colors font-medium"
                >
                  Update <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </SettingRow>
            </div>
          </div>
        )}

        {/* Regional */}
        <div className="card p-5">
          <SectionHeader
            icon={<Globe className="w-4 h-4" />}
            title="Regional"
            desc="Timezone and display format preferences"
          />
          <div>
            <SettingRow label="Timezone" desc="Used for post timestamps">
              <select className="text-sm bg-[#0a0c13] border border-[#1e2130] rounded-lg px-2.5 py-1 text-zinc-300 focus:outline-none focus:border-indigo-500/50 cursor-pointer">
                <option>UTC (default)</option>
                <option>Europe/Copenhagen</option>
                <option>America/New_York</option>
                <option>America/Los_Angeles</option>
                <option>Asia/Tokyo</option>
                <option>Asia/Singapore</option>
              </select>
            </SettingRow>
            <SettingRow label="Price format" desc="How numbers are displayed">
              <select className="text-sm bg-[#0a0c13] border border-[#1e2130] rounded-lg px-2.5 py-1 text-zinc-300 focus:outline-none focus:border-indigo-500/50 cursor-pointer">
                <option>Auto (smart decimals)</option>
                <option>Fixed 2 decimals</option>
                <option>Fixed 5 decimals</option>
              </select>
            </SettingRow>
          </div>
        </div>

        <button
          onClick={saveProfile}
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition-colors"
        >
          Save preferences
        </button>
      </div>
    </div>
  );
}
