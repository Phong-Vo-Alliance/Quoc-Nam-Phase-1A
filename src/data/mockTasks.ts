// src/data/mockTasks.ts
import type { Task } from "@/features/portal/types";

const iso = (d = new Date()) => d.toISOString();

/**
 * Giả lập các user id:
 * - Leader: u_thanh_truc
 * - Staff : u_thu_an, u_diem_chi, u_le_binh
 * Nhóm: grp_vh_kho
 * WorkTypes: wt_nhan_hang | wt_doi_tra | wt_phe_pham | wt_can_hang
 */

export const mockTasks: Task[] = [
  {
    id: "task_001",
    title: "Kiểm tra biên bản nhận hàng đợt 2",
    description: "Xác nhận đủ hàng nhập kho ngày hôm nay.",
    groupId: "grp_vh_kho",
    workTypeId: "wt_nhan_hang",
    sourceMessageId: "msg_0001",           // message id tham chiếu trong chat
    assigneeId: "u_thu_an",
    assignedById: "u_thanh_truc",          // leader giao
    status: "in_progress",
    checklist: [
      { id: "chk_001_1", label: "Đối chiếu số lượng hàng nhập", done: true },
      { id: "chk_001_2", label: "Chụp ảnh hàng hóa", done: false },
      { id: "chk_001_3", label: "Cập nhật vào hệ thống", done: false },
    ],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), // 4h trước
    updatedAt: new Date().toISOString(),
  },
  {
    id: "task_002",
    title: "Lập danh sách đổi trả NCC",
    description: "Danh sách hàng đổi trả với nhà cung cấp CP.",
    groupId: "grp_vh_kho",
    workTypeId: "wt_nhan_hang",
    sourceMessageId: "msg_0008",
    assigneeId: "u_diem_chi",
    assignedById: "u_thanh_truc",
    status: "done",
    checklist: [
      { id: "chk_002_1", label: "Kiểm tra số lượng hàng lỗi", done: false },
      { id: "chk_002_2", label: "Chuẩn bị phiếu đổi trả", done: false },
    ],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(), // hôm qua
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // cách đây 20h
  },
  {
    id: "task_003",
    title: "Xác nhận phế phẩm tồn kho Q4",
    description: "Kiểm tra tình trạng các thùng hỏng.",
    groupId: "grp_vh_kho",
    workTypeId: "wt_nhan_hang",
    sourceMessageId: "msg_0012",
    assigneeId: "u_diem_chi",
    assignedById: "u_thanh_truc",
    status: "done",
    checklist: [
      { id: "chk_003_1", label: "Ghi nhận danh sách phế phẩm", done: true },
      { id: "chk_003_2", label: "Upload hình ảnh minh chứng", done: true },
      { id: "chk_003_3", label: "Chờ xác nhận Leader", done: false },
    ],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 ngày trước
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 40).toISOString(), // cách đây 40h
  },
  {
    id: "task_004",
    title: "Cân hàng nhập cuối ngày",
    description: "Đảm bảo đủ trọng lượng hàng về trước 18h.",
    groupId: "grp_vh_kho",
    workTypeId: "wt_nhan_hang",
    sourceMessageId: "msg_0003",
    assigneeId: "u_diem_chi",
    assignedById: "u_thanh_truc",
    status: "awaiting_review",
    checklist: [
      { id: "chk_004_1", label: "Cập nhật trọng lượng từng kiện", done: true },
      { id: "chk_004_2", label: "Xác nhận báo cáo", done: true },
    ],
    createdAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5' trước
  },
  {
    id: "task_005",
    title: "Theo dõi phiếu đổi trả NCC tuần 45",
    description: "Tổng hợp dữ liệu đổi trả và xác nhận với Leader.",
    groupId: "grp_vh_kho",
    workTypeId: "wt_nhan_hang",
    sourceMessageId: "msg_0020",
    assigneeId: "u_diem_chi",
    assignedById: "u_thanh_truc",
    status: "todo",
    checklist: [
      { id: "chk_005_1", label: "Thu thập biên bản lỗi", done: false },
      { id: "chk_005_2", label: "Làm việc với NCC", done: false },
      { id: "chk_005_3", label: "Gửi báo cáo cho Leader", done: false },
    ],
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15' trước
    updatedAt: new Date().toISOString(),
  },
  {
    id: "task_006",
    title: "Theo dõi phiếu đổi trả NCC",
    description: "Tổng hợp dữ liệu đổi trả và xác nhận với Leader.",
    groupId: "grp_vh_kho",
    workTypeId: "wt_doi_tra",
    sourceMessageId: "msg_0022",
    assigneeId: "u_diem_chi",
    assignedById: "u_thanh_truc",
    status: "todo",
    checklist: [
      { id: "chk_006_1", label: "Thu thập biên bản lỗi", done: false },
      { id: "chk_006_2", label: "Làm việc với NCC", done: false },
      { id: "chk_006_3", label: "Gửi báo cáo cho Leader", done: false },
    ],
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15' trước
    updatedAt: new Date().toISOString(),
  },

  // =========================
  // 2 task hoàn thành TRONG NGÀY HÔM NAY (wt_nhan_hang)
  // =========================
  {
    id: "task_007",
    title: "Nhận hàng lô PO-2025-003 (sáng)",
    description: "Lô hàng nhập buổi sáng, đã kiểm đủ số lượng và tình trạng.",
    groupId: "grp_vh_kho",
    workTypeId: "wt_nhan_hang",
    sourceMessageId: "msg_0001", // tái sử dụng message nhận hàng
    assigneeId: "u_thu_an",
    assignedById: "u_thanh_truc",
    status: "done",
    checklist: [
      { id: "chk_007_1", label: "Kiểm đếm số lượng", done: true },
      { id: "chk_007_2", label: "Chụp ảnh biên bản", done: true },
    ],
    // 3 giờ trước
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    // 1 giờ trước
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 1).toISOString(),
  },
  {
    id: "task_008",
    title: "Nhận hàng lô PO-2025-004 (chiều)",
    description: "Hàng nhập cuối ngày, đã xác nhận đủ chứng từ với NCC.",
    groupId: "grp_vh_kho",
    workTypeId: "wt_nhan_hang",
    sourceMessageId: "msg_0003", // tham chiếu cân hàng / nhận hàng
    assigneeId: "u_diem_chi",
    assignedById: "u_thanh_truc",
    status: "done",
    checklist: [
      { id: "chk_008_1", label: "Đối chiếu phiếu nhập", done: true },
      { id: "chk_008_2", label: "Hoàn tất cập nhật hệ thống", done: true },
    ],
    // 6 giờ trước
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    // 2 giờ trước
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },

  // =========================
  // 3 task hoàn thành CÁC NGÀY TRƯỚC (wt_nhan_hang)
  // =========================
  {
    id: "task_009",
    title: "Nhận hàng tuần trước – PO-2025-090",
    description: "Lô hàng lớn nhập cho chương trình cuối tuần, đã hoàn tất.",
    groupId: "grp_vh_kho",
    workTypeId: "wt_nhan_hang",
    sourceMessageId: "msg_0020",
    assigneeId: "u_diem_chi",
    assignedById: "u_thanh_truc",
    status: "done",
    checklist: [
      { id: "chk_009_1", label: "Kiểm đếm và ghi nhận số lượng", done: true },
      { id: "chk_009_2", label: "Chụp ảnh pallet hàng", done: true },
    ],
    // 2 ngày trước
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    // 2 ngày trước + 2h
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 46).toISOString(),
  },
  {
    id: "task_010",
    title: "Nhập kho đơn lẻ đầu tuần",
    description: "Các đơn lẻ nhỏ từ NCC khác, đã nhập kho xong.",
    groupId: "grp_vh_kho",
    workTypeId: "wt_nhan_hang",
    sourceMessageId: "msg_0008",
    assigneeId: "u_thu_an",
    assignedById: "u_thanh_truc",
    status: "done",
    checklist: [
      { id: "chk_010_1", label: "Kiểm tra tình trạng thùng", done: true },
    ],
    // 3 ngày trước
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    // 3 ngày trước + 1h
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 71).toISOString(),
  },
  {
    id: "task_011",
    title: "Nhập kho phế phẩm tái chế",
    description: "Nhập kho các kiện hàng chuyển sang khu phế phẩm.",
    groupId: "grp_vh_kho",
    workTypeId: "wt_nhan_hang",
    sourceMessageId: "msg_0012",
    assigneeId: "u_diem_chi",
    assignedById: "u_thanh_truc",
    status: "done",
    checklist: [
      { id: "chk_011_1", label: "Phân loại phế phẩm", done: true },
      { id: "chk_011_2", label: "Cập nhật vị trí kho", done: true },
    ],
    // 5 ngày trước
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 120).toISOString(),
    // 5 ngày trước + 3h
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 117).toISOString(),
  },
  

  // =========================
  // LEADER OWN TASKS (u_thanh_truc)
  // =========================

  // 1. TODO task for leader
  {
    id: "task_leader_001",
    title: "Phê duyệt kế hoạch nhập hàng tháng 12",
    description: "Xem xét và phê duyệt kế hoạch nhập hàng từ phòng mua hàng",
    groupId: "grp_vh_kho",
    workTypeId: "wt_nhan_hang",
    sourceMessageId: "msg_0030",
    assigneeId: "u_thanh_truc", // ✅ Leader
    assignedById: "u_admin",
    status: "todo",
    checklist: [
      { id: "chk_l001_1", label: "Xem báo cáo tồn kho hiện tại", done: false },
      { id: "chk_l001_2", label: "So sánh với dự báo bán hàng", done: false },
      { id: "chk_l001_3", label: "Phê duyệt hoặc yêu cầu điều chỉnh", done: false },
    ],
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 phút trước
    updatedAt: new Date().toISOString(),
  },

  // 2. IN_PROGRESS task for leader
  {
    id: "task_leader_002",
    title: "Đánh giá hiệu suất team tháng 11",
    description: "Tổng hợp KPI và đánh giá từng thành viên",
    groupId: "grp_vh_kho",
    workTypeId: "wt_nhan_hang",
    sourceMessageId: "msg_0031",
    assigneeId: "u_thanh_truc",
    assignedById: "u_admin",
    status: "in_progress",
    checklist: [
      { id: "chk_l002_1", label: "Thu thập dữ liệu KPI", done: true },
      { id: "chk_l002_2", label: "Viết nhận xét cho từng người", done: false },
      { id: "chk_l002_3", label: "Gửi báo cáo cho giám đốc", done: false },
    ],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 giờ trước
    updatedAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 phút trước
  },

  // 3. DONE TODAY task for leader
  {
    id: "task_leader_003",
    title: "Họp với NCC về chất lượng hàng hóa",
    description: "Cuộc họp buổi sáng với NCC CP về vấn đề đổi trả",
    groupId: "grp_vh_kho",
    workTypeId: "wt_nhan_hang",
    sourceMessageId: "msg_0032",
    assigneeId: "u_thanh_truc",
    assignedById: "u_admin",
    status: "done",
    checklist: [
      { id: "chk_l003_1", label: "Chuẩn bị tài liệu họp", done: true },
      { id: "chk_l003_2", label: "Tham gia cuộc họp", done: true },
      { id: "chk_l003_3", label: "Gửi biên bản họp", done: true },
    ],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(), // 8 giờ trước
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), // 4 giờ trước (hôm nay)
  },

  // 4. DONE TODAY task #2 for leader
  {
    id: "task_leader_004",
    title: "Kiểm tra báo cáo tồn kho tuần",
    description: "Xác nhận số liệu tồn kho cuối tuần",
    groupId: "grp_vh_kho",
    workTypeId: "wt_nhan_hang",
    sourceMessageId: "msg_0033",
    assigneeId: "u_thanh_truc",
    assignedById: "u_admin",
    status: "done",
    checklist: [
      { id: "chk_l004_1", label: "Đối chiếu số liệu hệ thống", done: true },
      { id: "chk_l004_2", label: "Xác nhận với kế toán", done: true },
    ],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(), // 6 giờ trước
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 giờ trước
  },

  // =========================
  // PAST COMPLETED TASKS (Leader)
  // =========================

  // 5. Yesterday
  {
    id: "task_leader_005",
    title: "Phê duyệt đề xuất mua thiết bị kho",
    description: "Duyệt đơn mua 3 xe nâng mới",
    groupId: "grp_vh_kho",
    workTypeId: "wt_nhan_hang",
    sourceMessageId: "msg_0034",
    assigneeId: "u_thanh_truc",
    assignedById: "u_admin",
    status: "done",
    checklist: [
      { id: "chk_l005_1", label: "Xem báo giá từ 3 nhà cung cấp", done: true },
      { id: "chk_l005_2", label: "So sánh chất lượng", done: true },
      { id: "chk_l005_3", label: "Phê duyệt NCC tốt nhất", done: true },
    ],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString(), // 30 giờ trước
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(), // 26 giờ trước (hôm qua)
  },

  // 6. 2 days ago
  {
    id: "task_leader_006",
    title: "Đào tạo quy trình mới cho team",
    description: "Hướng dẫn team về quy trình nhập kho điện tử",
    groupId: "grp_vh_kho",
    workTypeId: "wt_nhan_hang",
    sourceMessageId: "msg_0035",
    assigneeId: "u_thanh_truc",
    assignedById: "u_admin",
    status: "done",
    checklist: [
      { id: "chk_l006_1", label: "Chuẩn bị slide đào tạo", done: true },
      { id: "chk_l006_2", label: "Tổ chức buổi training", done: true },
      { id: "chk_l006_3", label: "Thu thập feedback", done: true },
    ],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 52).toISOString(), // 52 giờ trước
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 48 giờ trước (2 ngày)
  },

  // 7. 3 days ago
  {
    id: "task_leader_007",
    title: "Xử lý khiếu nại từ phòng bán hàng",
    description: "Giải quyết vấn đề thiếu hàng trong đơn POS-9876",
    groupId: "grp_vh_kho",
    workTypeId: "wt_nhan_hang",
    sourceMessageId: "msg_0036",
    assigneeId: "u_thanh_truc",
    assignedById: "u_admin",
    status: "done",
    checklist: [
      { id: "chk_l007_1", label: "Điều tra nguyên nhân thiếu hàng", done: true },
      { id: "chk_l007_2", label: "Phối hợp với NCC bổ sung", done: true },
      { id: "chk_l007_3", label: "Thông báo kết quả cho bán hàng", done: true },
    ],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 76).toISOString(), // 76 giờ trước
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(), // 72 giờ trước (3 ngày)
  },

  // 8. 5 days ago
  {
    id: "task_leader_008",
    title: "Lập kế hoạch kiểm kê cuối tháng",
    description: "Chuẩn bị kế hoạch kiểm kê tồn kho tháng 11",
    groupId: "grp_vh_kho",
    workTypeId: "wt_nhan_hang",
    sourceMessageId: "msg_0037",
    assigneeId: "u_thanh_truc",
    assignedById: "u_admin",
    status: "done",
    checklist: [
      { id: "chk_l008_1", label: "Phân công nhân viên kiểm kê", done: true },
      { id: "chk_l008_2", label: "Chuẩn bị checklist kiểm đếm", done: true },
      { id: "chk_l008_3", label: "Gửi kế hoạch cho giám đốc", done: true },
    ],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 124).toISOString(), // 124 giờ trước
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 120).toISOString(), // 120 giờ trước (5 ngày)
  },

  // 9. 7 days ago
  {
    id: "task_leader_009",
    title: "Đánh giá NCC tháng 11",
    description: "Tổng hợp và đánh giá hiệu suất các nhà cung cấp",
    groupId: "grp_vh_kho",
    workTypeId: "wt_nhan_hang",
    sourceMessageId: "msg_0038",
    assigneeId: "u_thanh_truc",
    assignedById: "u_admin",
    status: "done",
    checklist: [
      { id: "chk_l009_1", label: "Thu thập dữ liệu giao hàng đúng hạn", done: true },
      { id: "chk_l009_2", label: "Tính toán tỷ lệ lỗi hàng hóa", done: true },
      { id: "chk_l009_3", label: "Gửi báo cáo đánh giá NCC", done: true },
    ],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 172).toISOString(), // 172 giờ trước
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 168).toISOString(), // 168 giờ trước (7 ngày)
  },

  // 10. 10 days ago
  {
    id: "task_leader_010",
    title: "Họp ban lãnh đạo về chiến lược Q4",
    description: "Tham gia cuộc họp chiến lược kinh doanh quý 4",
    groupId: "grp_vh_kho",
    workTypeId: "wt_nhan_hang",
    sourceMessageId: "msg_0039",
    assigneeId: "u_thanh_truc",
    assignedById: "u_admin",
    status: "done",
    checklist: [
      { id: "chk_l010_1", label: "Chuẩn bị báo cáo vận hành kho Q3", done: true },
      { id: "chk_l010_2", label: "Đề xuất cải tiến quy trình", done: true },
    ],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 244).toISOString(), // 244 giờ trước
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 240).toISOString(), // 240 giờ trước (10 ngày)
  },
];
