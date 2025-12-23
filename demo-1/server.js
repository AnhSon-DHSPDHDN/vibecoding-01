/**
 * Phần mềm cập nhật giá vàng realtime
 * Cập nhật mỗi 5 giây
 */

const https = require("https");

// Sử dụng API từ goldprice.org (miễn phí, đáng tin cậy)
const GOLD_API_URL = "https://data-asg.goldprice.org/dbXRates/USD";

/**
 * Fetch giá vàng từ API
 */
async function fetchGoldPrice() {
  return new Promise((resolve, reject) => {
    const url = "https://data-asg.goldprice.org/dbXRates/USD";

    const request = https.get(
      url,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
          Accept: "*/*",
          "Accept-Language": "en-US,en;q=0.9",
          Connection: "keep-alive",
        },
        servername: "data-asg.goldprice.org",
      },
      (res) => {
        let data = "";

        res.on("data", (chunk) => {
          data += chunk;
        });

        res.on("end", () => {
          try {
            const jsonData = JSON.parse(data);
            resolve(jsonData);
          } catch (error) {
            reject(new Error("Lỗi parse dữ liệu JSON: " + error.message));
          }
        });
      }
    );

    request.on("error", (error) => {
      reject(error);
    });

    request.end();
  });
}

/**
 * Format số thành tiền tệ VND
 */
function formatVND(number) {
  return new Intl.NumberFormat("vi-VN").format(Math.round(number));
}

/**
 * Format và hiển thị giá vàng
 */
function displayGoldPrice(data) {
  // Clear terminal
  console.clear();

  const now = new Date().toLocaleString("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    hour12: false,
  });

  console.log("═══════════════════════════════════════════════════════");
  console.log("          📊 GIÁ VÀNG THỜI GIAN THỰC");
  console.log("═══════════════════════════════════════════════════════");
  console.log(`⏰ Cập nhật lúc: ${now}`);
  console.log("───────────────────────────────────────────────────────");

  if (data && data.items && data.items.length > 0) {
    // goldprice.org API format
    const goldData = data.items[0];
    const xauPrice = goldData.xauPrice;
    const xauClose = goldData.xauClose;
    const change = xauPrice - xauClose;
    const changePercent = (change / xauClose) * 100;

    console.log(`💰 Giá vàng spot (XAU/USD):`);
    console.log(`   Hiện tại: ${xauPrice.toFixed(2)} USD/oz`);
    console.log(
      `   Thay đổi: ${change >= 0 ? "+" : ""}${change.toFixed(2)} USD (${
        change >= 0 ? "+" : ""
      }${changePercent.toFixed(2)}%)`
    );
    console.log(`   Giá đóng cửa: ${xauClose.toFixed(2)} USD/oz`);

    // Quy đổi sang VND (tỷ giá xấp xỉ 1 USD = 25,000 VND)
    const exchangeRate = 25000;
    const pricePerOzVND = xauPrice * exchangeRate;
    const pricePerGramVND = (xauPrice / 31.1035) * exchangeRate; // 1 oz = 31.1035g
    const pricePerTaelVND = pricePerGramVND * 37.5; // 1 lượng = 37.5g

    console.log("───────────────────────────────────────────────────────");
    console.log(`💎 Quy đổi giá vàng (VND):`);
    console.log(`   ${formatVND(pricePerOzVND)} VND/oz`);
    console.log(`   ${formatVND(pricePerGramVND)} VND/gram`);
    console.log(`   ${formatVND(pricePerTaelVND)} VND/lượng (37.5g)`);
  } else {
    console.log("❌ Không có dữ liệu giá vàng");
    console.log(
      "📊 Dữ liệu nhận được:",
      JSON.stringify(data, null, 2).substring(0, 200)
    );
  }

  console.log("═══════════════════════════════════════════════════════");
  console.log("💡 Tự động cập nhật sau 5 giây...");
  console.log("   Nhấn Ctrl+C để thoát");
  console.log("═══════════════════════════════════════════════════════\n");
}

/**
 * Cập nhật giá vàng
 */
async function updateGoldPrice() {
  try {
    console.log("🔄 Đang tải dữ liệu giá vàng từ goldprice.org...");
    const data = await fetchGoldPrice();
    displayGoldPrice(data);
  } catch (error) {
    console.error("❌ Lỗi khi lấy dữ liệu giá vàng:", error.message);
    console.log("🔄 Thử lại sau 5 giây...\n");
  }
}

/**
 * Khởi động chương trình
 */
function start() {
  console.log("═══════════════════════════════════════════════════════");
  console.log("    🚀 PHẦN MỀM CẬP NHẬT GIÁ VÀNG REALTIME");
  console.log("═══════════════════════════════════════════════════════");
  console.log("📡 Đang kết nối đến API goldprice.org...");
  console.log("⏱️  Chu kỳ cập nhật: 5 giây\n");

  // Cập nhật ngay lập tức
  updateGoldPrice();

  // Cập nhật mỗi 5 giây
  setInterval(updateGoldPrice, 5000);
}

// Xử lý tín hiệu thoát
process.on("SIGINT", () => {
  console.log("\n\n═══════════════════════════════════════════════════════");
  console.log("    👋 Đã dừng chương trình. Tạm biệt!");
  console.log("═══════════════════════════════════════════════════════");
  process.exit(0);
});

// Khởi động
start();
