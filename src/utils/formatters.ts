export function formatCurrency(value: number, currency = 'Kz'): string {
  const formatted = new Intl.NumberFormat('pt-AO', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
  return `${formatted} ${currency}`;
}

export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat('pt-AO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  } catch {
    return dateString;
  }
}

export function formatDateTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat('pt-AO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return dateString;
  }
}

// Generate simple SVG Code 128 / EAN pseudo barcode pattern
export function generateBarcodeBars(code: string): number[] {
  // Generate deterministic array of bar widths for crisp SVG rendering
  let hash = 0;
  for (let i = 0; i < code.length; i++) {
    hash = (hash << 5) - hash + code.charCodeAt(i);
    hash |= 0;
  }
  const bars: number[] = [];
  // Standard start guard
  bars.push(2, 1, 2, 1);
  for (let i = 0; i < code.length; i++) {
    const charCode = code.charCodeAt(i);
    const w1 = ((charCode * 3) % 4) + 1;
    const w2 = ((charCode * 5) % 3) + 1;
    const w3 = ((charCode * 7) % 4) + 1;
    bars.push(w1, w2, w3, 1);
  }
  // Stop guard
  bars.push(2, 1, 2, 2);
  return bars;
}

// Generate a deterministic SVG matrix for QR-like rendering
export function generateQRMatrix(text: string, size = 21): boolean[][] {
  const matrix: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));
  
  // Position Detection Patterns (Corners)
  const drawCornerFinder = (startX: number, startY: number) => {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        if (
          r === 0 || r === 6 || c === 0 || c === 6 ||
          (r >= 2 && r <= 4 && c >= 2 && c <= 4)
        ) {
          matrix[startY + r][startX + c] = true;
        } else {
          matrix[startY + r][startX + c] = false;
        }
      }
    }
  };

  drawCornerFinder(0, 0); // Top-left
  drawCornerFinder(size - 7, 0); // Top-right
  drawCornerFinder(0, size - 7); // Bottom-left

  // Timing patterns
  for (let i = 8; i < size - 8; i++) {
    matrix[6][i] = i % 2 === 0;
    matrix[i][6] = i % 2 === 0;
  }

  // Pseudo-random payload pattern based on hash of text
  let seed = 0;
  for (let i = 0; i < text.length; i++) {
    seed = (seed * 31 + text.charCodeAt(i)) & 0xffffffff;
  }

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      // Don't overwrite corner finders or timing patterns
      const inTopLeft = r < 8 && c < 8;
      const inTopRight = r < 8 && c >= size - 8;
      const inBottomLeft = r >= size - 8 && c < 8;
      const inTiming = r === 6 || c === 6;

      if (!inTopLeft && !inTopRight && !inBottomLeft && !inTiming) {
        seed = (seed * 1103515245 + 12345) & 0x7fffffff;
        matrix[r][c] = (seed % 100) > 48;
      }
    }
  }

  return matrix;
}

export function generateBarcodeSvgDataUrl(code: string): string {
  const bars = generateBarcodeBars(code);
  const barWidth = 2;
  const height = 48;
  const totalWidth = bars.reduce((sum, b) => sum + b * barWidth, 0) + 16;

  let x = 8;
  let rects = '';
  bars.forEach((w, idx) => {
    const isBlack = idx % 2 === 0;
    if (isBlack) {
      rects += `<rect x="${x}" y="2" width="${w * barWidth}" height="${height}" fill="#0f172a" />`;
    }
    x += w * barWidth;
  });

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalWidth} ${height + 4}" width="${totalWidth}" height="${height + 4}">${rects}</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function generateQrSvgDataUrl(text: string): string {
  const matrix = generateQRMatrix(text, 21);
  const size = matrix.length;
  const cellSize = 6;
  const padding = 8;
  const total = size * cellSize + padding * 2;

  let rects = '';
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (matrix[r][c]) {
        rects += `<rect x="${padding + c * cellSize}" y="${padding + r * cellSize}" width="${cellSize}" height="${cellSize}" fill="#0f172a" />`;
      }
    }
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${total} ${total}" width="${total}" height="${total}"><rect width="${total}" height="${total}" fill="#ffffff"/>${rects}</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
