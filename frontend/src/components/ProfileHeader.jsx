import { LogOutIcon, VolumeOffIcon, Volume2Icon } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import NotificationBell from "./NotificationBell";

const mouseClickSound = new Audio("/sounds/mouse-click.mp3");

function ProfileHeader() {
  const { logout, authUser } = useAuthStore();
  const { isSoundEnabled, toggleSound } = useChatStore();

  return (
    <div className="border-b border-slate-700/50 p-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-3">
          <div className="avatar online shrink-0">
            <div className="size-12 overflow-hidden rounded-full">
              <img src="/avatar.png" alt="Default profile" className="size-full object-cover" />
            </div>
          </div>
          <div className="min-w-0">
            <h3 className="max-w-[7.5rem] truncate text-sm font-semibold text-slate-100">
              {authUser.fullName}
            </h3>
            <p className="text-xs text-slate-400">Your workspace</p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-0.5">
          <NotificationBell />
          <button
            type="button"
            onClick={() => {
              mouseClickSound.currentTime = 0;
              mouseClickSound.play().catch(() => {});
              toggleSound();
            }}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-700/60 hover:text-slate-100"
            aria-label={isSoundEnabled ? "Turn sounds off" : "Turn sounds on"}
            title={isSoundEnabled ? "Turn sounds off" : "Turn sounds on"}
          >
            {isSoundEnabled ? <Volume2Icon className="size-5" /> : <VolumeOffIcon className="size-5" />}
          </button>
          <button
            type="button"
            onClick={logout}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-700/60 hover:text-slate-100"
            aria-label="Log out"
            title="Log out"
          >
            <LogOutIcon className="size-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProfileHeader;
