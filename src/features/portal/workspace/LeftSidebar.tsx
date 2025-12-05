import React from "react";
import type { GroupChat } from '../types';
import { SegmentedTabs } from "../components/SegmentedTabs";

/* ===================== Types (props mới) ===================== */
type ChatTarget = { type: "group" | "dm"; id: string };

export interface LeftSidebarProps {
  currentUserId: string;

  // Nhóm chat
  groups: GroupChat[];
  selectedGroup?: GroupChat;
  onSelectGroup?: (groupId: string) => void;

  // Tin nhắn cá nhân (không hiển thị avatar theo yêu cầu)
  contacts: Array<{
    id: string;
    name: string;                // "Thu An"
    role: "Leader" | "Member";   // hiển thị vai trò
    online: boolean;             // trạng thái online/offline
    lastMessage?: string;        // text | "[hình ảnh]" | "[pdf]"
    lastTime?: string;           // nếu muốn (không bắt buộc)
    unreadCount?: number;
  }>;

  // callback mở hội thoại
  onSelectChat: (target: ChatTarget) => void;
}

/* ===================== UI helpers ===================== */
const btn = (active = false) =>
  `rounded-lg border px-3 py-1 transition ${
    active
      ? "bg-brand-600 text-white border-brand-600 shadow-sm"
      : "bg-white text-brand-700 border-brand-200 hover:bg-brand-50"
  }`;

const inputCls =
  "rounded-lg border px-3 py-2 text-sm border-brand-200 focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-300";

const rowCls =
  "flex items-center gap-3 p-2 hover:bg-brand-50 cursor-pointer transition-colors";

const badgeUnread = (n?: number) =>
  n && n > 0 ? (
    <span className="ml-2 inline-flex min-w-[20px] justify-center rounded-full bg-brand-600 px-1.5 text-[10px] font-semibold text-white">
      {n > 99 ? "99+" : n}
    </span>
  ) : null;

const dotOnline = (on: boolean) => (
  <span
    className={`inline-block h-2 w-2 rounded-full ${
      on ? "bg-emerald-500" : "bg-gray-300"
    }`}
  />
);

// Lấy ký tự viết tắt từ tên nhóm
const initials = (name: string) =>
  name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

/* ===================== Component ===================== */
export const LeftSidebar: React.FC<LeftSidebarProps> = ({
  currentUserId,
  groups,
  selectedGroup,
  onSelectGroup,
  contacts,
  onSelectChat,
}) => {
  const [tab, setTab] = React.useState<"groups" | "contacts">("groups"); // mặc định: nhóm
  const [q, setQ] = React.useState("");

  // filter chung theo search
  const match = (text?: string) =>
    (text || "").toLowerCase().includes(q.trim().toLowerCase());

  const filteredGroups = groups.filter(
    (g) => match(g.name) || match(g.lastMessage) || match(g.lastSender)
  );

  const filteredContacts = contacts.filter(
    (c) => match(c.name) || match(c.lastMessage)
  );

  return (
    <aside className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-y-auto min-h-0">
      {/* Header: Tabs + Search */}
      <div className="border-b p-3">
        <div className="flex items-center justify-between">
          <div className="font-medium">Tin nhắn</div>          
          <div className="text-xs">
            <SegmentedTabs
              tabs={[
                { key: "groups", label: "Nhóm" },
                { key: "contacts", label: "Cá nhân" },
              ]}
              active={tab}
              onChange={(v) => setTab(v as any)}
              textClass="text-xs"
            />
          </div>
        </div>

        <div className="mt-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Tìm nhóm hoặc đồng nghiệp…"
            className={`w-full ${inputCls}`}
          />
        </div>
      </div>

      {/* Content */}
      <div className="">
        {tab === "groups" ? (
          <ul className="divide-y">
            {filteredGroups.length === 0 && (
              <div className="p-3 text-xs text-gray-500">Không có nhóm phù hợp.</div>
            )}

            {filteredGroups.map((g) => (
              <li
                key={g.id}
                className={`${rowCls} ${selectedGroup?.id === g.id ? "bg-brand-50 ring-1 ring-brand-100" : ""}`}
                onClick={() => onSelectGroup?.(g.id)}
              >
                {/* Avatar group (chỉ 1 avatar đơn) */}
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-600/10 text-brand-700 border border-brand-100">
                  <span className="text-[11px] font-semibold">{initials(g.name)}</span>
                </div>

                <div className="min-w-0 flex-1">
                  {/* Row 1: tên nhóm + thời gian */}
                  <div className="flex items-center justify-between">
                    <p className="truncate text-sm font-medium">{g.name}</p>
                    {g.lastTime && (
                      <span className="ml-2 shrink-0 text-xs text-gray-400">
                        {g.lastTime}
                      </span>
                    )}
                  </div>

                  {/* Row 2: last message + unread badge align phải */}
                  <div className="flex items-center justify-between">
                    <p className="truncate text-xs text-gray-500 mr-2">
                      {g.lastSender ? `${g.lastSender}: ` : ""}
                      {g.lastMessage || ""}
                    </p>

                    {/* Badge always pinned to the right */}
                    {badgeUnread(g.unreadCount)}
                  </div>
                </div>

                
              </li>
            ))}
          </ul>
        ) : (
          <ul className="divide-y">
            {filteredContacts.length === 0 && (
              <div className="p-3 text-xs text-gray-500">Không có liên hệ phù hợp.</div>
            )}

            {filteredContacts.map((c) => (
              <li
                key={c.id}
                className={rowCls}
                onClick={() => onSelectChat({ type: "dm", id: c.id })}
              >
                {/* Không hiển thị avatar theo yêu cầu */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-medium">{c.name}</p>
                      <span
                        className={`rounded px-1.5 py-0.5 text-[10px] ${
                          c.role === "Leader"
                            ? "bg-brand-50 text-brand-700 border border-brand-200"
                            : "bg-gray-50 text-gray-600 border border-gray-200"
                        }`}
                      >
                        {c.role}
                      </span>
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        {dotOnline(c.online)} {c.online ? "Online" : "Offline"}
                      </span>
                    </div>

                    {c.unreadCount ? (
                      <span className="ml-2 shrink-0">
                        {badgeUnread(c.unreadCount)}
                      </span>
                    ) : null}
                  </div>

                  <p className="truncate text-xs text-gray-500">{c.lastMessage || ""}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  );
};
