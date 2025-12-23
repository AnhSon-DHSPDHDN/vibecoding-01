/**
 * Gold Price Tracking Application
 * Fetches and displays real-time gold prices every 5 seconds
 */

const https = require("https");

// API Configuration - Using Gold Price API (free tier)
const API_CONFIG = {
  host: "api.gold-api.com",
  path: "/price/XAU", // XAU = Gold
  method: "GET",
};

// Alternative: Using metalpriceapi.com (requires free API key from https://metalpriceapi.com/)
// Uncomment and add your API key if you prefer this source
// const API_KEY = 'your_api_key_here';

// Store current exchange rate
let currentExchangeRate = 24500; // Default fallback rate

// Trading Simulation Variables
let tradingCapital = 10000000; // Vốn khởi điểm: 10.000.000 VND
const MAX_MARGIN = 0.3; // Margin tối đa 30%
let currentPosition = null; // Vị thế hiện tại
let tradeHistory = []; // Lịch sử giao dịch
let currentGoldPriceVND = 0; // Giá vàng hiện tại (VND/chỉ)
let priceHistory = []; // Lịch sử giá để phân tích (lưu 50 điểm dữ liệu gần nhất)

/**
 * Fetch current USD to VND exchange rate
 * @returns {Promise<number>} Exchange rate
 */
function fetchExchangeRate() {
  return new Promise((resolve, reject) => {
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
            resolve(currentExchangeRate); // Fallback to current rate
          }
        } catch (error) {
          resolve(currentExchangeRate); // Fallback on error
        }
      });
    });

    req.on("error", () => {
      resolve(currentExchangeRate); // Fallback on error
    });

    req.setTimeout(5000, () => {
      req.destroy();
      resolve(currentExchangeRate); // Fallback on timeout
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
 * Alternative: Fetch from metalpriceapi.com
 * @param {string} apiKey - Your API key
 * @returns {Promise<Object>} Gold price data
 */
function fetchGoldPriceFromMetalAPI(apiKey) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: "api.metalpriceapi.com",
      path: `/v1/latest?api_key=${apiKey}&base=USD&currencies=XAU`,
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
          resolve(jsonData);
        } catch (error) {
          reject(new Error("Failed to parse response"));
        }
      });
    });

    req.on("error", (error) => {
      reject(error);
    });

    req.end();
  });
}

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
      signal: "WAIT", // Chưa đủ dữ liệu
      reason: "Chưa đủ dữ liệu lịch sử (cần ít nhất 20 điểm)",
      confidence: 0,
    };
  }

  // Tính các Moving Average
  const ma5 = calculateMovingAverage(priceHistory, 5); // MA ngắn hạn (5 điểm ~ 25 giây)
  const ma10 = calculateMovingAverage(priceHistory, 10); // MA trung hạn (10 điểm ~ 50 giây)
  const ma20 = calculateMovingAverage(priceHistory, 20); // MA dài hạn (20 điểm ~ 100 giây)

  const currentPrice = priceHistory[priceHistory.length - 1];
  const previousPrice = priceHistory[priceHistory.length - 2];

  // Tính momentum (động lượng giá)
  const momentum = currentPrice - priceHistory[priceHistory.length - 6]; // So với 6 điểm trước
  const momentumPercent =
    (momentum / priceHistory[priceHistory.length - 6]) * 100;

  // Tính độ biến động (volatility)
  const recentPrices = priceHistory.slice(-10);
  const volatility = Math.max(...recentPrices) - Math.min(...recentPrices);
  const volatilityPercent = (volatility / currentPrice) * 100;

  let signal = "WAIT";
  let reason = "";
  let confidence = 0;

  // Chiến lược: Golden Cross / Death Cross với momentum
  if (ma5 > ma10 && ma10 > ma20) {
    // Xu hướng tăng mạnh (Golden Cross)
    if (momentum > 0 && currentPrice > ma5) {
      signal = "LONG";
      reason = "Xu hướng tăng mạnh (MA5 > MA10 > MA20) + Momentum dương";
      confidence = Math.min(90, 60 + Math.abs(momentumPercent) * 10);
    }
  } else if (ma5 < ma10 && ma10 < ma20) {
    // Xu hướng giảm mạnh (Death Cross)
    if (momentum < 0 && currentPrice < ma5) {
      signal = "SHORT";
      reason = "Xu hướng giảm mạnh (MA5 < MA10 < MA20) + Momentum âm";
      confidence = Math.min(90, 60 + Math.abs(momentumPercent) * 10);
    }
  } else if (ma5 > ma10 && currentPrice > ma10 && momentum > 0) {
    // Xu hướng tăng vừa phải
    signal = "LONG";
    reason = "Xu hướng tăng (MA5 > MA10) + Giá trên MA10";
    confidence = Math.min(75, 50 + Math.abs(momentumPercent) * 5);
  } else if (ma5 < ma10 && currentPrice < ma10 && momentum < 0) {
    // Xu hướng giảm vừa phải
    signal = "SHORT";
    reason = "Xu hướng giảm (MA5 < MA10) + Giá dưới MA10";
    confidence = Math.min(75, 50 + Math.abs(momentumPercent) * 5);
  } else {
    signal = "WAIT";
    reason = "Thị trường sideway, không có tín hiệu rõ ràng";
    confidence = 0;
  }

  // Không giao dịch nếu độ biến động quá thấp (< 0.05%)
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
 * @param {string} type - Loại vị thế: 'LONG' hoặc 'SHORT'
 * @param {number} price - Giá vàng hiện tại
 */
function openPosition(type, price) {
  const margin = tradingCapital * MAX_MARGIN;
  currentPosition = {
    type: type,
    entryPrice: price,
    margin: margin,
    leverage: 1 / MAX_MARGIN, // Đòn bẩy = 1/margin
    openTime: new Date(),
  };
  console.log(
    `\n🔔 MỞ VỊ THẾ ${type} - Giá: ${price.toLocaleString(
      "vi-VN"
    )}đ/chỉ - Margin: ${margin.toLocaleString("vi-VN")}đ`
  );
}

/**
 * Đóng vị thế và tính toán lãi/lỗ
 * @param {number} exitPrice - Giá đóng vị thế
 */
function closePosition(exitPrice) {
  if (!currentPosition) return;

  const priceDiff = exitPrice - currentPosition.entryPrice;
  let profitLoss = 0;

  if (currentPosition.type === "LONG") {
    // Long: lời khi giá tăng
    profitLoss =
      (priceDiff / currentPosition.entryPrice) *
      currentPosition.margin *
      currentPosition.leverage;
  } else {
    // Short: lời khi giá giảm
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

  console.log(`\n💰 ĐÓNG VỊ THẾ ${currentPosition.type}`);
  console.log(
    `   Giá vào: ${currentPosition.entryPrice.toLocaleString("vi-VN")}đ/chỉ`
  );
  console.log(`   Giá ra: ${exitPrice.toLocaleString("vi-VN")}đ/chỉ`);
  console.log(
    `   ${profitLoss >= 0 ? "Lãi" : "Lỗ"}: ${Math.abs(
      profitLoss
    ).toLocaleString("vi-VN")}đ (${
      (profitLoss >= 0 ? "+" : "") +
      ((profitLoss / currentPosition.margin) * 100).toFixed(2)
    }%)`
  );

  currentPosition = null;
}

/**
 * Format and display gold price
 * @param {Object} data - Gold price data
 * @param {number} exchangeRate - Current USD to VND exchange rate
 */
function displayGoldPrice(data, exchangeRate) {
  // Clear console for fresh display
  console.clear();

  const timestamp = new Date().toLocaleString("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    hour12: false,
  });

  console.log(
    "╔══════════════════════════════════════════════════════════════════════════╗"
  );
  console.log(
    "║          GIAO DỊCH VÀNG FUTURE - THEO DÕI THỜI GIAN THỰC                ║"
  );
  console.log(
    "╠══════════════════════════════════════════════════════════════════════════╣"
  );
  console.log(`║  Thời gian: ${timestamp.padEnd(58)} ║`);
  console.log(
    "╠══════════════════════════════════════════════════════════════════════════╣"
  );
  console.log(
    `║  Tỉ giá USD/VND:     1 USD = ${exchangeRate
      .toLocaleString("vi-VN")
      .padEnd(39)}đ ║`
  );
  console.log(
    "╠══════════════════════════════════════════════════════════════════════════╣"
  );

  if (data.price) {
    const priceUSD = parseFloat(data.price);
    const priceVNDPerOz = priceUSD * exchangeRate;
    // Convert from oz to chỉ: 1 oz = 31.1035g, 1 chỉ = 3.75g
    const priceVNDPerChi = (priceVNDPerOz * (3.75 / 31.1035)).toFixed(0);
    currentGoldPriceVND = parseInt(priceVNDPerChi);

    // Lưu vào lịch sử giá (giới hạn 50 điểm gần nhất)
    priceHistory.push(currentGoldPriceVND);
    if (priceHistory.length > 50) {
      priceHistory.shift();
    }

    console.log(`║  Giá vàng (USD/oz):  $${priceUSD.toFixed(2).padEnd(49)} ║`);
    console.log(
      `║  Giá vàng (VND/chỉ): ${parseInt(priceVNDPerChi)
        .toLocaleString("vi-VN")
        .padEnd(50)}đ ║`
    );

    if (data.price_gram_24k) {
      console.log(
        `║  Giá vàng 24K:       $${parseFloat(data.price_gram_24k)
          .toFixed(2)
          .padEnd(49)} ║`
      );
    }
  } else if (data.rates && data.rates.XAU) {
    // For metalpriceapi format
    const pricePerOz = (1 / data.rates.XAU).toFixed(2);
    const priceVNDPerOz = pricePerOz * exchangeRate;
    // Convert from oz to chỉ: 1 oz = 31.1035g, 1 chỉ = 3.75g
    const priceVNDPerChi = (priceVNDPerOz * (3.75 / 31.1035)).toFixed(0);
    currentGoldPriceVND = parseInt(priceVNDPerChi);

    // Lưu vào lịch sử giá (giới hạn 50 điểm gần nhất)
    priceHistory.push(currentGoldPriceVND);
    if (priceHistory.length > 50) {
      priceHistory.shift();
    }

    console.log(`║  Giá vàng (USD/oz):  $${pricePerOz.padEnd(49)} ║`);
    console.log(
      `║  Giá vàng (VND/chỉ): ${parseInt(priceVNDPerChi)
        .toLocaleString("vi-VN")
        .padEnd(50)}đ ║`
    );
  } else {
    console.log(
      "║  Không thể lấy dữ liệu giá vàng                                          ║"
    );
  }

  console.log(
    "╠══════════════════════════════════════════════════════════════════════════╣"
  );
  console.log(
    "║  THÔNG TIN TÀI KHOẢN GIAO DỊCH                                           ║"
  );
  console.log(
    "╠══════════════════════════════════════════════════════════════════════════╣"
  );

  const totalProfitLoss = tradingCapital - 10000000;
  const profitColor = totalProfitLoss >= 0 ? "+" : "";
  console.log(
    `║  Vốn hiện tại:       ${tradingCapital
      .toLocaleString("vi-VN")
      .padEnd(50)}đ ║`
  );
  console.log(
    `║  Tổng lãi/lỗ:        ${profitColor}${totalProfitLoss
      .toLocaleString("vi-VN")
      .padEnd(49)}đ ║`
  );
  console.log(
    `║  Margin khả dụng:    ${(tradingCapital * MAX_MARGIN)
      .toLocaleString("vi-VN")
      .padEnd(50)}đ ║`
  );
  console.log(
    `║  Số lệnh đã đặt:     ${tradeHistory.length.toString().padEnd(50)} ║`
  );

  if (currentPosition) {
    const unrealizedPL =
      currentPosition.type === "LONG"
        ? ((currentGoldPriceVND - currentPosition.entryPrice) /
            currentPosition.entryPrice) *
          currentPosition.margin *
          currentPosition.leverage
        : ((currentPosition.entryPrice - currentGoldPriceVND) /
            currentPosition.entryPrice) *
          currentPosition.margin *
          currentPosition.leverage;

    console.log(
      "╠══════════════════════════════════════════════════════════════════════════╣"
    );
    console.log(`║  VỊ THẾ ĐANG MỞ: ${currentPosition.type.padEnd(58)} ║`);
    console.log(
      `║  Giá vào:            ${currentPosition.entryPrice
        .toLocaleString("vi-VN")
        .padEnd(50)}đ ║`
    );
    console.log(
      `║  Margin:             ${currentPosition.margin
        .toLocaleString("vi-VN")
        .padEnd(50)}đ ║`
    );
    console.log(
      `║  Lãi/Lỗ chưa chốt:   ${
        (unrealizedPL >= 0 ? "+" : "") +
        unrealizedPL.toLocaleString("vi-VN").padEnd(49)
      }đ ║`
    );
  }

  console.log(
    "╠══════════════════════════════════════════════════════════════════════════╣"
  );
  console.log(
    "║  Cập nhật giá: mỗi 5 giây | Giao dịch tự động: mỗi 60 giây              ║"
  );
  console.log(
    "║  Nhấn Ctrl+C để thoát                                                    ║"
  );
  console.log(
    "╚══════════════════════════════════════════════════════════════════════════╝"
  );

  // Hiển thị phân tích thị trường nếu đủ dữ liệu
  if (priceHistory.length >= 20) {
    const analysis = analyzeMarket();
    console.log("\n📈 PHÂN TÍCH THỊ TRƯỜNG:");
    console.log(
      `   Tín hiệu:     ${analysis.signal} ${
        analysis.signal === "LONG"
          ? "📈"
          : analysis.signal === "SHORT"
          ? "📉"
          : "⏸️"
      }`
    );
    console.log(`   Độ tin cậy:   ${analysis.confidence.toFixed(0)}%`);
    console.log(`   Lý do:        ${analysis.reason}`);
    if (analysis.indicators) {
      console.log(
        `   MA5:  ${parseInt(analysis.indicators.ma5).toLocaleString(
          "vi-VN"
        )}đ | MA10: ${parseInt(analysis.indicators.ma10).toLocaleString(
          "vi-VN"
        )}đ | MA20: ${parseInt(analysis.indicators.ma20).toLocaleString(
          "vi-VN"
        )}đ`
      );
      console.log(
        `   Momentum:     ${
          analysis.indicators.momentum > 0 ? "+" : ""
        }${parseInt(analysis.indicators.momentum).toLocaleString("vi-VN")}đ (${
          analysis.indicators.momentumPercent
        }%)`
      );
    }
  } else {
    console.log(`\n⏳ Thu thập dữ liệu... (${priceHistory.length}/20 điểm)`);
  }

  // Hiển thị 5 lệnh gần nhất
  if (tradeHistory.length > 0) {
    console.log("\n📊 LỊCH SỬ GIAO DỊCH GẦN NHẤT:");
    const recentTrades = tradeHistory.slice(-5).reverse();
    recentTrades.forEach((trade, index) => {
      const plSymbol = trade.profitLoss >= 0 ? "✅" : "❌";
      const plText = trade.profitLoss >= 0 ? "Lãi" : "Lỗ";
      console.log(
        `${plSymbol} ${trade.type} | Vào: ${trade.entryPrice.toLocaleString(
          "vi-VN"
        )}đ → Ra: ${trade.exitPrice.toLocaleString(
          "vi-VN"
        )}đ | ${plText}: ${Math.abs(trade.profitLoss).toLocaleString("vi-VN")}đ`
      );
    });
  }
}

/**
 * Display error message
 * @param {Error} error - Error object
 */
function displayError(error) {
  console.clear();
  console.log("╔══════════════════════════════════════════════════════════╗");
  console.log("║          CẬP NHẬT GIÁ VÀNG THỜI GIAN THỰC                ║");
  console.log("╠══════════════════════════════════════════════════════════╣");
  console.log("║  ⚠️  LỖI KẾT NỐI                                         ║");
  console.log("╠══════════════════════════════════════════════════════════╣");
  console.log(`║  ${error.message.padEnd(56)} ║`);
  console.log("╠══════════════════════════════════════════════════════════╣");
  console.log("║  Đang thử kết nối lại sau 5 giây...                      ║");
  console.log("║  Nhấn Ctrl+C để thoát                                    ║");
  console.log("╚══════════════════════════════════════════════════════════╝");
}

/**
 * Update gold price and display
 */
async function updateGoldPrice() {
  try {
    // Fetch both gold price and exchange rate in parallel
    const [goldData, exchangeRate] = await Promise.all([
      fetchGoldPrice(),
      fetchExchangeRate(),
    ]);

    // Update global exchange rate
    currentExchangeRate = exchangeRate;

    displayGoldPrice(goldData, exchangeRate);
  } catch (error) {
    displayError(error);
  }
}

/**
 * Thực hiện giao dịch tự động dựa trên phân tích
 */
function executeTrade() {
  if (tradingCapital <= 0) {
    console.log("\n⚠️  TÀI KHOẢN ĐÃ CẠN VỐN - DỪNG GIAO DỊCH");
    return;
  }

  if (currentPosition) {
    // Đóng vị thế hiện tại
    closePosition(currentGoldPriceVND);
  } else {
    // Phân tích thị trường và quyết định
    const analysis = analyzeMarket();

    if (analysis.signal === "LONG" || analysis.signal === "SHORT") {
      console.log(`\n🤖 PHÂN TÍCH: ${analysis.reason}`);
      console.log(`   Độ tin cậy: ${analysis.confidence.toFixed(0)}%`);
      openPosition(analysis.signal, currentGoldPriceVND);
    } else {
      console.log(`\n⏸️  KHÔNG GIAO DỊCH: ${analysis.reason}`);
    }
  }
}

/**
 * Start the gold price tracking application
 */
function startGoldPriceTracker() {
  console.log("🚀 Đang khởi động ứng dụng giao dịch vàng future...\n");
  console.log("💰 Vốn khởi điểm: 10.000.000 VND");
  console.log("📊 Margin tối đa: 30%");
  console.log("⏱️  Chu kỳ giao dịch: 60 giây");
  console.log(
    "🤖 Chiến lược: Technical Analysis (Moving Average + Momentum)\n"
  );

  // Initial fetch
  updateGoldPrice();

  // Update every 5 seconds
  setInterval(updateGoldPrice, 5000);

  // Execute trade every 60 seconds
  setInterval(executeTrade, 60000);
}

// Handle graceful shutdown
process.on("SIGINT", () => {
  console.clear();
  console.log(
    "\n╔══════════════════════════════════════════════════════════════════════════╗"
  );
  console.log(
    "║  KẾT THÚC PHIÊN GIAO DỊCH                                                ║"
  );
  console.log(
    "╠══════════════════════════════════════════════════════════════════════════╣"
  );

  const totalProfitLoss = tradingCapital - 10000000;
  const profitPercent = ((totalProfitLoss / 10000000) * 100).toFixed(2);

  console.log(
    `║  Vốn ban đầu:        10.000.000đ                                         ║`
  );
  console.log(
    `║  Vốn cuối cùng:      ${tradingCapital
      .toLocaleString("vi-VN")
      .padEnd(50)}đ ║`
  );
  console.log(
    `║  Tổng lãi/lỗ:        ${
      (totalProfitLoss >= 0 ? "+" : "") +
      totalProfitLoss.toLocaleString("vi-VN").padEnd(49)
    }đ ║`
  );
  console.log(
    `║  Tỷ lệ:              ${
      (totalProfitLoss >= 0 ? "+" : "") + profitPercent
    }%${"".padEnd(Math.max(0, 61 - profitPercent.length))} ║`
  );
  console.log(
    `║  Số lệnh giao dịch:  ${tradeHistory.length.toString().padEnd(50)} ║`
  );

  const winTrades = tradeHistory.filter((t) => t.profitLoss > 0).length;
  const lossTrades = tradeHistory.filter((t) => t.profitLoss < 0).length;
  const winRate =
    tradeHistory.length > 0
      ? ((winTrades / tradeHistory.length) * 100).toFixed(2)
      : 0;

  console.log(`║  Lệnh thắng:         ${winTrades.toString().padEnd(50)} ║`);
  console.log(`║  Lệnh thua:          ${lossTrades.toString().padEnd(50)} ║`);
  console.log(
    `║  Tỷ lệ thắng:        ${winRate}%${"".padEnd(
      Math.max(0, 61 - winRate.length)
    )} ║`
  );
  console.log(
    "╠══════════════════════════════════════════════════════════════════════════╣"
  );
  console.log(
    "║  Cảm ơn bạn đã sử dụng ứng dụng giao dịch vàng future!                   ║"
  );
  console.log(
    "╚══════════════════════════════════════════════════════════════════════════╝\n"
  );
  process.exit(0);
});

// Start the application
startGoldPriceTracker();
