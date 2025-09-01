function hexToHsl(hex) {
  let r = parseInt(hex.slice(1, 3), 16) / 255;
  let g = parseInt(hex.slice(3, 5), 16) / 255;
  let b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h,
    s,
    l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return { h: h * 360, s: s * 100, l: l * 100 };
}

function hslToRgba(h, s, l, a = 1) {
  s /= 100;
  l /= 100;
  const k = (n) => (n + h / 30) % 12;
  const aChroma = s * Math.min(l, 1 - l);
  const f = (n) =>
    l - aChroma * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return `rgba(${Math.round(f(0) * 255)}, ${Math.round(f(8) * 255)}, ${Math.round(f(4) * 255)}, ${a})`;
}

export function makeDeeper(hex, saturationBoost = 1.2, lightnessDrop = 0.99) {
  let { h, s, l } = hexToHsl(hex);
  s = Math.min(100, s * saturationBoost);
  l = Math.max(0, l * lightnessDrop);
  return hslToRgba(h, s, l);
}
