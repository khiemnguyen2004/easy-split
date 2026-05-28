# 📋 Hệ thống EasySplit - Product Backlog & User Stories

Tài liệu này đặc tả danh sách các câu chuyện người dùng (User Stories) dựa trên 15 Use Cases đã thống nhất, phục vụ việc triển khai hệ thống quản lý chi tiêu nhóm EasySplit với cấu trúc 12 bảng Database.

---

## 🏗 EPIC 1: QUẢN LÝ ĐỊNH DANH VÀ QUAN HỆ (IDENTITY & RELATIONSHIPS)

### US-01 | Khởi tạo nhóm và Phân quyền (Ref: UC-01)
* **Câu chuyện:** Là một người dùng, tôi muốn tạo nhóm mới, đặt tên, ảnh đại diện và ngân sách dự kiến để bắt đầu quản lý tài chính chung.
* **Điều kiện nghiệm thu (AC):**
    * [ ] Cho phép nhập `name`, `description`, `budget_amount` và chọn tiền tệ.
    * [ ] Người tạo được gán `role = 'admin'` trong bảng `group_members`.
    * [ ] Hệ thống sinh `invite_code` duy nhất 6-10 ký tự.

### US-02 | Gia nhập và Điều phối thành viên (Ref: UC-02)
* **Câu chuyện:** Là một người dùng, tôi muốn gia nhập nhóm bằng mã mời để đảm bảo tính riêng tư; Là Admin, tôi muốn quản lý danh sách thành viên để kiểm soát quyền truy cập.
* **Điều kiện nghiệm thu (AC):**
    * [ ] Kiểm tra `invite_code` hợp lệ trước khi thêm vào `group_members`.
    * [ ] Admin có quyền xóa thành viên (trừ chính mình).
    * [ ] Không cho phép xóa thành viên nếu họ còn khoản nợ chưa quyết toán.

### US-03 | Cấu hình Danh mục chi tiêu (Ref: UC-03)
* **Câu chuyện:** Là một người dùng, tôi muốn phân loại khoản chi theo các danh mục như Ăn uống, Di chuyển... để báo cáo tài chính rõ ràng hơn.
* **Điều kiện nghiệm thu (AC):**
    * [ ] Hiển thị danh sách từ bảng `categories`.
    * [ ] Cho phép gán `category_id` cho mỗi bản ghi `expenses`.

---

## ⚙️ EPIC 2: HỆ THỐNG TÍNH TOÁN LÕI (CORE BILLING ENGINE)

### US-04 | Ghi nhận chi tiêu đa chế độ (Ref: UC-04)
* **Câu chuyện:** Là người trả tiền, tôi muốn chia tiền theo nhiều cách (chia đều hoặc chọn người tham gia) để phản ánh đúng thực tế chi dùng.
* **Điều kiện nghiệm thu (AC):**
    * [ ] Chế độ chia đều: Tự động chia `amount` cho toàn bộ active members.
    * [ ] Chế độ chọn lọc: Chỉ tạo bản ghi trong `expense_splits` cho những người được chọn.
    * [ ] Tổng `share_amount` phải khớp với tổng `amount` của hóa đơn.

### US-05 | Lưu trữ minh chứng hóa đơn (Ref: UC-05)
* **Câu chuyện:** Là người dùng, tôi muốn đính kèm ảnh hóa đơn khi thêm chi tiêu để tăng tính minh bạch.
* **Điều kiện nghiệm thu (AC):**
    * [ ] Tích hợp Camera/Gallery để upload ảnh lên Supabase Storage.
    * [ ] Lưu URL ảnh vào trường `image_url` trong bảng `expenses`.

### US-06 | Truy vết lịch sử chỉnh sửa (Ref: UC-06)
* **Câu chuyện:** Là một thành viên, tôi muốn biết ai là người cập nhật khoản chi gần nhất để đối soát khi có sai sót.
* **Điều kiện nghiệm thu (AC):**
    * [ ] Tự động cập nhật `updated_by` khi có bất kỳ thay đổi nào trong bản ghi `expenses`.

---

## 💰 EPIC 3: THANH KHOẢN VÀ QUYẾT TOÁN (SETTLEMENTS & FUNDINGS)

### US-07 | Tối ưu hóa nợ - Netting (Ref: UC-07)
* **Câu chuyện:** Là một thành viên, tôi muốn hệ thống bù trừ nợ tự động giữa các thành viên để giảm số lượng giao dịch chuyển khoản.
* **Điều kiện nghiệm thu (AC):**
    * [ ] Thuật toán tính toán vị thế ròng (Net Position) của từng người.
    * [ ] Trả về danh sách nợ tối giản (Ví dụ: A trả C 100k thay vì A trả B và B trả C).

### US-08 | Quyết toán nợ 2 bước (Ref: UC-08)
* **Câu chuyện:** Là người nợ, tôi muốn upload bằng chứng chuyển khoản; Là người nhận, tôi muốn xác nhận đã nhận tiền để xóa nợ.
* **Điều kiện nghiệm thu (AC):**
    * [ ] Tạo bản ghi `settlements` với trạng thái `pending`.
    * [ ] Cho phép upload ảnh vào `proof_img`.
    * [ ] Chỉ người nhận (`creditor_id`) mới có quyền xác nhận để chuyển trạng thái thành `confirmed`.

### US-09 & US-10 | Quản lý và Đối soát Quỹ (Ref: UC-09, UC-10)
* **Câu chuyện:** Là một nhóm, chúng tôi muốn đóng tiền quỹ trước để chi dùng chung; Admin cần phê duyệt bằng chứng đóng tiền của thành viên.
* **Điều kiện nghiệm thu (AC):**
    * [ ] Hiển thị tiến độ đóng quỹ trong bảng `fundings`.
    * [ ] Admin xác nhận bản ghi trong `fund_contributions` để ghi tăng số dư quỹ thực tế.

---

## 💬 EPIC 4: TƯƠNG TÁC NGƯỜI DÙNG (INTERACTIONS)

### US-11 | Thông báo nhắc nợ Push Notification (Ref: UC-11)
* **Câu chuyện:** Là chủ nợ, tôi muốn hệ thống gửi thông báo nhắc nhở những người chưa trả tiền cho tôi.
* **Điều kiện nghiệm thu (AC):**
    * [ ] Gửi Push thông qua `device_token`.
    * [ ] Lưu lịch sử vào bảng `notifications`.

### US-12 | Chat & Media đa phương tiện (Ref: UC-12)
* **Câu chuyện:** Là thành viên, tôi muốn thảo luận về các hóa đơn bằng tin nhắn và hình ảnh ngay trong ứng dụng.
* **Điều kiện nghiệm thu (AC):**
    * [ ] Tin nhắn Real-time.
    * [ ] Hỗ trợ gửi nhiều ảnh (Lưu vào bảng `media` liên kết với `message_id`).

### US-13 | Trung tâm thông báo & Deep Linking (Ref: UC-13)
* **Câu chuyện:** Là người dùng, tôi muốn quản lý các thông báo liên quan và nhấn vào để mở nhanh nội dung tương ứng.
* **Điều kiện nghiệm thu (AC):**
    * [ ] Danh sách `notifications` hiển thị theo thời gian mới nhất.
    * [ ] Xử lý trường `data` (JSON) để điều hướng màn hình.

---

## 📊 EPIC 5: PHÂN TÍCH VÀ BÁO CÁO (REPORTING)

### US-14 | Thống kê chi tiêu theo Danh mục (Ref: UC-14)
* **Câu chuyện:** Là người dùng, tôi muốn xem biểu đồ chi tiêu để biết tiền của mình đã dùng vào việc gì.
* **Điều kiện nghiệm thu (AC):**
    * [ ] Tổng hợp số liệu từ `expenses` group theo `category_name`.
    * [ ] Hiển thị biểu đồ Pie Chart/Bar Chart.

### US-15 | Xuất báo cáo tài chính (Ref: UC-15)
* **Câu chuyện:** Là Admin, tôi muốn xuất dữ liệu ra file để lưu giữ minh chứng cho cả nhóm sau một chuyến đi hoặc một tháng sinh hoạt.
* **Điều kiện nghiệm thu (AC):**
    * [ ] Xuất file định dạng PDF/Excel chứa: Tổng chi, Chi tiết từng người, Trạng thái nợ cuối cùng.

---
**Ghi chú chung:** Tất cả API phải kiểm tra quyền sở hữu thông qua RLS Policies của Supabase.