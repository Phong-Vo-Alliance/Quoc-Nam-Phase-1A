// ---- Mock groups (Tin nhắn nhóm) ----
export const mockGroups = [
  {
    id: "grp_vh_kho",
    name: "Vận hành - Kho Hàng",
    lastSender: "Thu An",
    lastMessage: "[pdf]",       // nếu là ảnh: "[hình ảnh]"
    lastTime: "09:55",
    unreadCount: 3,
  },
  {
    id: "grp_vh_taixe",
    name: "Vận hành - Tài xế tỉnh",
    lastSender: "Huyền",
    lastMessage: "Đã nhận hàng [hình ảnh]",
    lastTime: "09:30",
    unreadCount: 0,
  },
];

// ---- Mock contacts (Tin nhắn cá nhân) ----
// Không hiển thị avatar theo yêu cầu
export const mockContacts = [
  {
    id: "u_thanh_truc",
    name: "Thanh Trúc",
    role: "Leader" as const,
    online: true,
    lastMessage: "Bạn: Ok, đã nhận!",
    lastTime: "09:50",
    unreadCount: 0,
  },
  {
    id: "u_thu_an",
    name: "Thu An",
    role: "Member" as const,
    online: false,
    lastMessage: "Huyền: [pdf]",
    lastTime: "09:45",
    unreadCount: 2,
  },
  {
    id: "u_ngoc_vang",
    name: "Ngọc Vàng",
    role: "Member" as const,
    online: true,
    lastMessage: "Trúc: Hình ảnh cập nhật",
    lastTime: "09:40",
    unreadCount: 0,
  },
  {
    id: "u_diem_chi",
    name: "Diễm Chi",
    role: "Member" as const,
    online: false,
    lastMessage: "Bạn: check giúp kho",
    lastTime: "09:35",
    unreadCount: 0,
  },
];
