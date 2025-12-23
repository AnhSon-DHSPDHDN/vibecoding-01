/**
 * Utils tính diện tích các hình học phổ biến
 */

/**
 * Tính diện tích hình vuông
 * @param {number} side - Độ dài cạnh
 * @returns {number} Diện tích
 */
function squareArea(side) {
  if (side <= 0) throw new Error("Cạnh phải lớn hơn 0");
  return side * side;
}

/**
 * Tính diện tích hình chữ nhật
 * @param {number} length - Chiều dài
 * @param {number} width - Chiều rộng
 * @returns {number} Diện tích
 */
function rectangleArea(length, width) {
  if (length <= 0 || width <= 0)
    throw new Error("Chiều dài và chiều rộng phải lớn hơn 0");
  return length * width;
}

/**
 * Tính diện tích hình tròn
 * @param {number} radius - Bán kính
 * @returns {number} Diện tích
 */
function circleArea(radius) {
  if (radius <= 0) throw new Error("Bán kính phải lớn hơn 0");
  return Math.PI * radius * radius;
}

/**
 * Tính diện tích hình tam giác (theo công thức cơ bản)
 * @param {number} base - Đáy
 * @param {number} height - Chiều cao
 * @returns {number} Diện tích
 */
function triangleArea(base, height) {
  if (base <= 0 || height <= 0)
    throw new Error("Đáy và chiều cao phải lớn hơn 0");
  return (base * height) / 2;
}

/**
 * Tính diện tích tam giác theo công thức Heron
 * @param {number} a - Cạnh thứ nhất
 * @param {number} b - Cạnh thứ hai
 * @param {number} c - Cạnh thứ ba
 * @returns {number} Diện tích
 */
function triangleAreaHeron(a, b, c) {
  if (a <= 0 || b <= 0 || c <= 0) throw new Error("Các cạnh phải lớn hơn 0");
  if (a + b <= c || a + c <= b || b + c <= a) {
    throw new Error("Ba cạnh không tạo thành tam giác hợp lệ");
  }
  const s = (a + b + c) / 2; // Nửa chu vi
  return Math.sqrt(s * (s - a) * (s - b) * (s - c));
}

/**
 * Tính diện tích hình thang
 * @param {number} base1 - Đáy lớn
 * @param {number} base2 - Đáy nhỏ
 * @param {number} height - Chiều cao
 * @returns {number} Diện tích
 */
function trapezoidArea(base1, base2, height) {
  if (base1 <= 0 || base2 <= 0 || height <= 0) {
    throw new Error("Các đáy và chiều cao phải lớn hơn 0");
  }
  return ((base1 + base2) * height) / 2;
}

/**
 * Tính diện tích hình bình hành
 * @param {number} base - Đáy
 * @param {number} height - Chiều cao
 * @returns {number} Diện tích
 */
function parallelogramArea(base, height) {
  if (base <= 0 || height <= 0)
    throw new Error("Đáy và chiều cao phải lớn hơn 0");
  return base * height;
}

/**
 * Tính diện tích hình thoi
 * @param {number} diagonal1 - Đường chéo thứ nhất
 * @param {number} diagonal2 - Đường chéo thứ hai
 * @returns {number} Diện tích
 */
function rhombusArea(diagonal1, diagonal2) {
  if (diagonal1 <= 0 || diagonal2 <= 0) {
    throw new Error("Các đường chéo phải lớn hơn 0");
  }
  return (diagonal1 * diagonal2) / 2;
}

/**
 * Tính diện tích hình elip
 * @param {number} majorAxis - Bán trục lớn
 * @param {number} minorAxis - Bán trục nhỏ
 * @returns {number} Diện tích
 */
function ellipseArea(majorAxis, minorAxis) {
  if (majorAxis <= 0 || minorAxis <= 0) {
    throw new Error("Các bán trục phải lớn hơn 0");
  }
  return Math.PI * majorAxis * minorAxis;
}

/**
 * Tính diện tích hình quạt tròn
 * @param {number} radius - Bán kính
 * @param {number} angle - Góc ở tâm (đơn vị: độ)
 * @returns {number} Diện tích
 */
function sectorArea(radius, angle) {
  if (radius <= 0 || angle <= 0)
    throw new Error("Bán kính và góc phải lớn hơn 0");
  return (Math.PI * radius * radius * angle) / 360;
}

/**
 * Tính diện tích hình quạt tròn (góc tính theo radian)
 * @param {number} radius - Bán kính
 * @param {number} angleRad - Góc ở tâm (đơn vị: radian)
 * @returns {number} Diện tích
 */
function sectorAreaRadian(radius, angleRad) {
  if (radius <= 0 || angleRad <= 0)
    throw new Error("Bán kính và góc phải lớn hơn 0");
  return (radius * radius * angleRad) / 2;
}

/**
 * Tính diện tích hình đa giác đều
 * @param {number} sides - Số cạnh
 * @param {number} sideLength - Độ dài mỗi cạnh
 * @returns {number} Diện tích
 */
function regularPolygonArea(sides, sideLength) {
  if (sides < 3) throw new Error("Số cạnh phải lớn hơn hoặc bằng 3");
  if (sideLength <= 0) throw new Error("Độ dài cạnh phải lớn hơn 0");
  return (sides * sideLength * sideLength) / (4 * Math.tan(Math.PI / sides));
}

/**
 * Tính diện tích hình lục giác đều
 * @param {number} sideLength - Độ dài cạnh
 * @returns {number} Diện tích
 */
function hexagonArea(sideLength) {
  if (sideLength <= 0) throw new Error("Độ dài cạnh phải lớn hơn 0");
  return (3 * Math.sqrt(3) * sideLength * sideLength) / 2;
}

// Export các hàm
module.exports = {
  squareArea,
  rectangleArea,
  circleArea,
  triangleArea,
  triangleAreaHeron,
  trapezoidArea,
  parallelogramArea,
  rhombusArea,
  ellipseArea,
  sectorArea,
  sectorAreaRadian,
  regularPolygonArea,
  hexagonArea,
};
