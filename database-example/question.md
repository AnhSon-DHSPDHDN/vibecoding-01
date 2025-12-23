## Basic

1. Liệt kê tất cả các vendors ở California (CA)
2. Tìm tổng số invoices trong hệ thống
3. Hiển thị tất cả payment terms và số ngày thanh toán
4. Lấy danh sách 10 vendors có vendor_id nhỏ nhất
5. Tìm các invoices có invoice_total lớn hơn $1000

## Easy

6. Tính tổng invoice_total theo từng vendor_state
7. Tìm các vendors chưa có invoice nào (sử dụng LEFT JOIN)
8. Liệt kê các invoices có payment_date NULL (chưa thanh toán)
9. Tìm invoice có giá trị lớn nhất và thông tin vendor tương ứng
10. Đếm số lượng invoices theo từng tháng trong năm 2018

## Medium

11. Tính tổng doanh thu (invoice_total) của top 5 vendors có doanh thu cao nhất
12. Tìm các vendors có nhiều hơn 5 invoices và tổng giá trị invoices > $10,000
13. Tính số ngày trung bình từ invoice_date đến payment_date cho các invoices đã thanh toán
14. Liệt kê các line items có amount lớn hơn trung bình của account_number đó
15. Tìm vendors có cả invoices đã thanh toán và chưa thanh toán, kèm số lượng từng loại
