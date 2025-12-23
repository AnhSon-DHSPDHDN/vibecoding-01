# Phần Mềm Cập Nhật Giá Vàng Realtime

## Mô tả
Phần mềm cập nhật giá vàng thời gian thực mỗi 5 giây, hiển thị trên Terminal.

## Tính năng
- ✅ Cập nhật giá vàng tự động mỗi 5 giây
- ✅ Hiển thị giá vàng XAU/USD realtime
- ✅ Hiển thị thông tin chi tiết: giá hiện tại, thay đổi, cao/thấp nhất
- ✅ Ước tính quy đổi sang VND/lượng
- ✅ Sử dụng API miễn phí từ metals.live

## Cách chạy

### Bước 1: Cài đặt Node.js
Đảm bảo bạn đã cài đặt Node.js (phiên bản 12 trở lên)

### Bước 2: Chạy chương trình
```bash
node server.js
```

### Bước 3: Thoát chương trình
Nhấn `Ctrl+C` để dừng chương trình

## API được sử dụng
- **Metals.live API** (https://metals.live) - API miễn phí, không cần đăng ký
- Dự phòng: GoldAPI.io (cần đăng ký để lấy API key miễn phí)

## Nâng cấp
Nếu muốn sử dụng API chính thức với nhiều tính năng hơn:

1. **GoldAPI.io**:
   - Đăng ký tại: https://www.goldapi.io
   - Lấy API key miễn phí
   - Thay thế `GOLD_API_KEY` trong code

2. **MetalPriceAPI**:
   - Đăng ký tại: https://metalpriceapi.com
   - Lấy API key miễn phí

## Lưu ý
- Tỷ giá VND/USD được cố định ở 24,500 VND
- Để có tỷ giá chính xác, cần tích hợp thêm API tỷ giá ngoại tệ
