/**
 * Calculate the area of a triangle using the formula: Area = (base * height) / 2
 * @param {number} base - The length of the base
 * @param {number} height - The height of the triangle
 * @returns {number} - The area of the triangle
 */
function calculateTriangleArea(base, height) {
  if (base <= 0 || height <= 0) {
    throw new Error("Base and height must be positive numbers");
  }
  return (base * height) / 2;
}

/**
 * Calculate the area of a rectangle using the formula: Area = width * height
 * @param {number} width - The width of the rectangle
 * @param {number} height - The height of the rectangle
 * @returns {number} - The area of the rectangle
 */
function calculateRectangleArea(width, height) {
  if (width <= 0 || height <= 0) {
    throw new Error("Width and height must be positive numbers");
  }
  return width * height;
}

/**
 * Calculate the sum of prime numbers up to a given number
 * @param {number} n - The upper limit
 * @returns {number} - The sum of all prime numbers up to n
 */
function sumOfPrimes(n) {
  if (n < 2) {
    return 0;
  }

  function isPrime(num) {
    if (num < 2) return false;
    if (num === 2) return true;
    if (num % 2 === 0) return false;

    for (let i = 3; i <= Math.sqrt(num); i += 2) {
      if (num % i === 0) return false;
    }
    return true;
  }

  let sum = 0;
  for (let i = 2; i <= n; i++) {
    if (isPrime(i)) {
      sum += i;
    }
  }

  return sum;
}

function sortArray(arr) {
  return arr.slice().sort((a, b) => a - b);
}

function fibonacci(n) {
  if (n <= 0) {
    throw new Error("Input must be a positive integer");
  }
  const fib = [0, 1];
  for (let i = 2; i < n; i++) {
    fib[i] = fib[i - 1] + fib[i - 2];
  }
  return fib.slice(0, n);
}

module.exports = { calculateTriangleArea, calculateRectangleArea };
