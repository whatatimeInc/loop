export type Persona = "mentor" | "guest";

export type SessionProfile = {
  id: string;
  name: string | null;
  last_name: string | null;
  username: string | null;
  photo_url: string | null;
};

export type SessionData = {
  id: string;
  mentor_id: string;
  guest_id: string;
  starts_at: string;
  duration: number;
  status: string;
  daily_room_url: string | null;
  daily_room_name: string | null;
  session_started_at: string | null;
  mentor: SessionProfile;
  guest: SessionProfile;
};

export type Screen =
  | "not-yet"
  | "expired"
  | "waiting"
  | "incall"
  | "post-call"
  | "no-show-mentor"
  | "no-show-guest"
  | "connection-lost";

export type TimeExtension = {
  id: string;
  requested_by: Persona;
  minutes_added: 5 | 10 | 15;
  status: "pending" | "accepted" | "declined";
};

export type ChatMessage = {
  id: string;
  sender: Persona;
  senderName: string;
  text: string;
  ts: number;
};
