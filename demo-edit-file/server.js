/**
 * Gold Price Tracking Web Server
 * Serves real-time gold prices via HTML interface
 */

const https = require("https");
const http = require("http");
const fs = require("fs");
const path = require("path");

// Store current exchange rate
let currentExchangeRate = 24500; // Default fallback rate
let cachedGoldData = null;
let lastUpdate = null;

// Trading Simulation Variables
let tradingCapital = 10000000; // Vốn khởi điểm: 10.000.000 VND
const MAX_MARGIN = 0.3; // Margin tối đa 30%
let currentPosition = null; // Vị thế hiện tại
let tradeHistory = []; // Lịch sử giao dịch
let currentGoldPriceVND = 0; // Giá vàng hiện tại (VND/chỉ)
let priceHistory = []; // Lịch sử giá để phân tích (lưu 50 điểm dữ liệu gần nhất)

/**
 * Tính trung bình động (Moving Average)
 * @param {number[]} data - Mảng dữ liệu giá
 * @param {number} period - Chu kỳ tính trung bình
 * @returns {number} Giá trị trung bình
 */
function calculateMovingAverage(data, period) {
  if (data.length < period) return data[data.length - 1] || 0;
  const slice = data.slice(-period);
  const sum = slice.reduce((acc, val) => acc + val, 0);
  return sum / period;
}

/**
 * Phân tích xu hướng giá dựa trên Moving Average
 * @returns {Object} Phân tích và tín hiệu giao dịch
 */
function analyzeMarket() {
  if (priceHistory.length < 20) {
    return {
      signal: "WAIT",
      reason: "Chưa đủ dữ liệu lịch sử (cần ít nhất 20 điểm)",
      confidence: 0,
    };
  }

  const ma5 = calculateMovingAverage(priceHistory, 5);
  const ma10 = calculateMovingAverage(priceHistory, 10);
  const ma20 = calculateMovingAverage(priceHistory, 20);
  const currentPrice = priceHistory[priceHistory.length - 1];
  const momentum = currentPrice - priceHistory[priceHistory.length - 6];
  const momentumPercent =
    (momentum / priceHistory[priceHistory.length - 6]) * 100;
  const recentPrices = priceHistory.slice(-10);
  const volatility = Math.max(...recentPrices) - Math.min(...recentPrices);
  const volatilityPercent = (volatility / currentPrice) * 100;

  let signal = "WAIT";
  let reason = "";
  let confidence = 0;

  if (ma5 > ma10 && ma10 > ma20) {
    if (momentum > 0 && currentPrice > ma5) {
      signal = "LONG";
      reason = "Xu hướng tăng mạnh (MA5 > MA10 > MA20) + Momentum dương";
      confidence = Math.min(90, 60 + Math.abs(momentumPercent) * 10);
    }
  } else if (ma5 < ma10 && ma10 < ma20) {
    if (momentum < 0 && currentPrice < ma5) {
      signal = "SHORT";
      reason = "Xu hướng giảm mạnh (MA5 < MA10 < MA20) + Momentum âm";
      confidence = Math.min(90, 60 + Math.abs(momentumPercent) * 10);
    }
  } else if (ma5 > ma10 && currentPrice > ma10 && momentum > 0) {
    signal = "LONG";
    reason = "Xu hướng tăng (MA5 > MA10) + Giá trên MA10";
    confidence = Math.min(75, 50 + Math.abs(momentumPercent) * 5);
  } else if (ma5 < ma10 && currentPrice < ma10 && momentum < 0) {
    signal = "SHORT";
    reason = "Xu hướng giảm (MA5 < MA10) + Giá dưới MA10";
    confidence = Math.min(75, 50 + Math.abs(momentumPercent) * 5);
  } else {
    signal = "WAIT";
    reason = "Thị trường sideway, không có tín hiệu rõ ràng";
    confidence = 0;
  }

  if (volatilityPercent < 0.05 && signal !== "WAIT") {
    signal = "WAIT";
    reason = "Độ biến động quá thấp, thị trường trầm";
    confidence = 0;
  }

  return {
    signal,
    reason,
    confidence,
    indicators: {
      ma5: ma5.toFixed(0),
      ma10: ma10.toFixed(0),
      ma20: ma20.toFixed(0),
      currentPrice: currentPrice.toFixed(0),
      momentum: momentum.toFixed(0),
      momentumPercent: momentumPercent.toFixed(2),
      volatilityPercent: volatilityPercent.toFixed(2),
    },
  };
}

/**
 * Mở vị thế giao dịch mới
 */
function openPosition(type, price) {
  const margin = tradingCapital * MAX_MARGIN;
  currentPosition = {
    type: type,
    entryPrice: price,
    margin: margin,
    leverage: 1 / MAX_MARGIN,
    openTime: new Date(),
  };
  console.log(
    `🔔 MỞ VỊ THẾ ${type} - Giá: ${price.toLocaleString("vi-VN")}đ/chỉ`
  );
}

/**
 * Đóng vị thế và tính toán lãi/lỗ
 */
function closePosition(exitPrice) {
  if (!currentPosition) return;

  const priceDiff = exitPrice - currentPosition.entryPrice;
  let profitLoss = 0;

  if (currentPosition.type === "LONG") {
    profitLoss =
      (priceDiff / currentPosition.entryPrice) *
      currentPosition.margin *
      currentPosition.leverage;
  } else {
    profitLoss =
      (-priceDiff / currentPosition.entryPrice) *
      currentPosition.margin *
      currentPosition.leverage;
  }

  tradingCapital += profitLoss;

  const tradeResult = {
    type: currentPosition.type,
    entryPrice: currentPosition.entryPrice,
    exitPrice: exitPrice,
    profitLoss: profitLoss,
    openTime: currentPosition.openTime,
    closeTime: new Date(),
    capitalAfter: tradingCapital,
  };

  tradeHistory.push(tradeResult);
  console.log(
    `💰 ĐÓNG VỊ THẾ ${currentPosition.type} - ${
      profitLoss >= 0 ? "Lãi" : "Lỗ"
    }: ${Math.abs(profitLoss).toLocaleString("vi-VN")}đ`
  );

  currentPosition = null;
}

/**
 * Thực hiện giao dịch tự động
 */
function executeTrade() {
  if (tradingCapital <= 0) {
    console.log("⚠️  TÀI KHOẢN ĐÃ CẠN VỐN - DỪNG GIAO DỊCH");
    return;
  }

  if (currentPosition) {
    closePosition(currentGoldPriceVND);
  } else {
    const analysis = analyzeMarket();
    if (analysis.signal === "LONG" || analysis.signal === "SHORT") {
      console.log(
        `🤖 PHÂN TÍCH: ${analysis.reason} (${analysis.confidence.toFixed(0)}%)`
      );
      openPosition(analysis.signal, currentGoldPriceVND);
    } else {
      console.log(`⏸️  KHÔNG GIAO DỊCH: ${analysis.reason}`);
    }
  }
}

/**
 * Fetch current USD to VND exchange rate
 * @returns {Promise<number>} Exchange rate
 */
function fetchExchangeRate() {
  return new Promise((resolve) => {
    const options = {
      hostname: "api.exchangerate-api.com",
      path: "/v4/latest/USD",
      method: "GET",
    };

    const req = https.request(options, (res) => {
      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        try {
          const jsonData = JSON.parse(data);
          if (jsonData.rates && jsonData.rates.VND) {
            resolve(jsonData.rates.VND);
          } else {
            resolve(currentExchangeRate);
          }
        } catch (error) {
          resolve(currentExchangeRate);
        }
      });
    });

    req.on("error", () => {
      resolve(currentExchangeRate);
    });

    req.setTimeout(5000, () => {
      req.destroy();
      resolve(currentExchangeRate);
    });

    req.end();
  });
}

/**
 * Fetch current gold price
 * @returns {Promise<Object>} Gold price data
 */
function fetchGoldPrice() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: "api.gold-api.com",
      path: "/price/XAU",
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    };

    const req = https.request(options, (res) => {
      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        try {
          const jsonData = JSON.parse(data);
          resolve(jsonData);
        } catch (error) {
          reject(new Error("Failed to parse response"));
        }
      });
    });

    req.on("error", (error) => {
      reject(error);
    });

    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error("Request timeout"));
    });

    req.end();
  });
}

/**
 * Update gold price data
 */
async function updateGoldData() {
  try {
    const [goldData, exchangeRate] = await Promise.all([
      fetchGoldPrice(),
      fetchExchangeRate(),
    ]);

    currentExchangeRate = exchangeRate;

    if (goldData.price) {
      const priceUSD = parseFloat(goldData.price);
      const priceVNDPerOz = priceUSD * exchangeRate;
      const priceVNDPerChi = (priceVNDPerOz * (3.75 / 31.1035)).toFixed(0);
      currentGoldPriceVND = parseInt(priceVNDPerChi);

      // Lưu vào lịch sử giá
      priceHistory.push(currentGoldPriceVND);
      if (priceHistory.length > 50) {
        priceHistory.shift();
      }

      // Tính lãi/lỗ chưa chốt nếu có vị thế
      let unrealizedPL = 0;
      if (currentPosition) {
        unrealizedPL =
          currentPosition.type === "LONG"
            ? ((currentGoldPriceVND - currentPosition.entryPrice) /
                currentPosition.entryPrice) *
              currentPosition.margin *
              currentPosition.leverage
            : ((currentPosition.entryPrice - currentGoldPriceVND) /
                currentPosition.entryPrice) *
              currentPosition.margin *
              currentPosition.leverage;
      }

      // Phân tích thị trường
      const analysis = analyzeMarket();

      // Tính thống kê trading
      const totalProfitLoss = tradingCapital - 10000000;
      const winTrades = tradeHistory.filter((t) => t.profitLoss > 0).length;
      const lossTrades = tradeHistory.filter((t) => t.profitLoss < 0).length;
      const winRate =
        tradeHistory.length > 0
          ? ((winTrades / tradeHistory.length) * 100).toFixed(2)
          : 0;

      cachedGoldData = {
        priceUSD: priceUSD.toFixed(2),
        priceVNDPerChi: parseInt(priceVNDPerChi).toLocaleString("vi-VN"),
        exchangeRate: exchangeRate.toLocaleString("vi-VN"),
        timestamp: new Date().toLocaleString("vi-VN", {
          timeZone: "Asia/Ho_Chi_Minh",
          hour12: false,
        }),
        success: true,
        // Trading data
        trading: {
          capital: tradingCapital,
          totalProfitLoss: totalProfitLoss,
          profitLossPercent: ((totalProfitLoss / 10000000) * 100).toFixed(2),
          marginAvailable: tradingCapital * MAX_MARGIN,
          totalTrades: tradeHistory.length,
          winTrades: winTrades,
          lossTrades: lossTrades,
          winRate: winRate,
          currentPosition: currentPosition
            ? {
                type: currentPosition.type,
                entryPrice: currentPosition.entryPrice,
                margin: currentPosition.margin,
                unrealizedPL: unrealizedPL,
                openTime: currentPosition.openTime.toLocaleString("vi-VN", {
                  timeZone: "Asia/Ho_Chi_Minh",
                  hour12: false,
                }),
              }
            : null,
          recentTrades: tradeHistory
            .slice(-5)
            .reverse()
            .map((t) => ({
              type: t.type,
              entryPrice: t.entryPrice,
              exitPrice: t.exitPrice,
              profitLoss: t.profitLoss,
              closeTime: t.closeTime.toLocaleString("vi-VN", {
                timeZone: "Asia/Ho_Chi_Minh",
                hour12: false,
              }),
            })),
          analysis: {
            signal: analysis.signal,
            reason: analysis.reason,
            confidence: analysis.confidence,
            indicators: analysis.indicators,
            dataPoints: priceHistory.length,
          },
        },
      };
    }

    lastUpdate = Date.now();
    console.log(`✅ Cập nhật giá vàng thành công: ${cachedGoldData.timestamp}`);
  } catch (error) {
    console.error(`❌ Lỗi cập nhật: ${error.message}`);
    if (!cachedGoldData) {
      cachedGoldData = {
        success: false,
        error: error.message,
      };
    }
  }
}

// Create HTTP server
const server = http.createServer((req, res) => {
  // API endpoint for gold price data
  if (req.url === "/api/gold-price") {
    res.writeHead(200, {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    });
    res.end(JSON.stringify(cachedGoldData || { success: false }));
    return;
  }

  // Serve HTML page
  if (req.url === "/" || req.url === "/index.html") {
    const htmlPath = path.join(__dirname, "public", "index.html");
    fs.readFile(htmlPath, "utf8", (err, data) => {
      if (err) {
        res.writeHead(500, { "Content-Type": "text/html; charset=utf-8" });
        res.end("<h1>Lỗi: Không tìm thấy file HTML</h1>");
        return;
      }
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(data);
    });
    return;
  }

  // 404 for other routes
  res.writeHead(404, { "Content-Type": "text/plain" });
  res.end("404 Not Found");
});

// Start server
const PORT = 3000;
server.listen(PORT, () => {
  console.log("\n🚀 ===================================");
  console.log(`📊 Server đang chạy tại: http://localhost:${PORT}`);
  console.log("🌐 Mở trình duyệt để xem giao diện");
  console.log("⏱️  Cập nhật tự động mỗi 5 giây");
  console.log("❌ Nhấn Ctrl+C để dừng server");
  console.log("=====================================\n");

  // Initial update
  updateGoldData();

  // Update every 5 seconds
  setInterval(updateGoldData, 5000);

  // Execute trade every 60 seconds
  setInterval(executeTrade, 60000);
});

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\n\n🛑 Đang dừng server...");
  server.close(() => {
    console.log("✅ Server đã dừng. Tạm biệt!\n");
    process.exit(0);
  });
});
