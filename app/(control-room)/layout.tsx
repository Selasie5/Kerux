import { ControlRoomShell } from "@/app/_components/control-room-shell";

export default function ControlRoomLayout({ children }: { children: React.ReactNode }) {
  return <ControlRoomShell>{children}</ControlRoomShell>;
}
