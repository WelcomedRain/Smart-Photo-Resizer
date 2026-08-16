export interface SampleImageDef {
  id: string;
  name: string;
  badge: string;
  width: number;
  height: number;
  description: string;
  category: string;
  generator: () => Promise<string>;
}

/**
 * Synchronous version to generate a crisp synthetic test canvas with grid lines, gradient, and dimension stamp
 */
export function createGeneratedImageSync(
  width: number,
  height: number,
  title: string,
  subtitle: string,
  theme: 'neon' | 'sunset' | 'ocean' | 'minimal'
): string {
  if (typeof document === 'undefined') return '';
  try {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return '';
    }

    // Gradient Background
    const grad = ctx.createLinearGradient(0, 0, width, height);
    if (theme === 'neon') {
      grad.addColorStop(0, '#18181b');
      grad.addColorStop(0.5, '#27272a');
      grad.addColorStop(1, '#09090b');
    } else if (theme === 'sunset') {
      grad.addColorStop(0, '#431407');
      grad.addColorStop(0.5, '#7c2d12');
      grad.addColorStop(1, '#1c1917');
    } else if (theme === 'ocean') {
      grad.addColorStop(0, '#082f49');
      grad.addColorStop(0.5, '#0369a1');
      grad.addColorStop(1, '#0f172a');
    } else {
      grad.addColorStop(0, '#1e1b4b');
      grad.addColorStop(0.5, '#312e81');
      grad.addColorStop(1, '#0f172a');
    }

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Decorative geometric shapes and focus marks
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = Math.max(2, Math.round(width / 500));

    // Grid lines
    const step = Math.max(50, Math.round(width / 10));
    for (let x = step; x < width; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = step; y < height; y += step) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Focal circular arcs & accent graphics
    const centerX = width / 2;
    const centerY = height / 2;
    const maxRadius = Math.min(width, height) * 0.38;

    // Glowing rings
    ctx.beginPath();
    ctx.arc(centerX, centerY, maxRadius, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(99, 102, 241, 0.4)';
    ctx.lineWidth = Math.max(4, Math.round(width / 200));
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(centerX, centerY, maxRadius * 0.7, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(168, 85, 247, 0.3)';
    ctx.stroke();

    // Crosshairs
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(centerX - 30, centerY);
    ctx.lineTo(centerX + 30, centerY);
    ctx.moveTo(centerX, centerY - 30);
    ctx.lineTo(centerX, centerY + 30);
    ctx.stroke();

    // Corner alignment brackets
    const bracketSize = Math.max(40, Math.round(width * 0.06));
    const pad = Math.max(24, Math.round(width * 0.03));
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 3;

    // Top-Left
    ctx.beginPath();
    ctx.moveTo(pad, pad + bracketSize);
    ctx.lineTo(pad, pad);
    ctx.lineTo(pad + bracketSize, pad);
    ctx.stroke();

    // Top-Right
    ctx.beginPath();
    ctx.moveTo(width - pad - bracketSize, pad);
    ctx.lineTo(width - pad, pad);
    ctx.lineTo(width - pad, pad + bracketSize);
    ctx.stroke();

    // Bottom-Left
    ctx.beginPath();
    ctx.moveTo(pad, height - pad - bracketSize);
    ctx.lineTo(pad, height - pad);
    ctx.lineTo(pad + bracketSize, height - pad);
    ctx.stroke();

    // Bottom-Right
    ctx.beginPath();
    ctx.moveTo(width - pad - bracketSize, height - pad);
    ctx.lineTo(width - pad, height - pad);
    ctx.lineTo(width - pad, height - pad - bracketSize);
    ctx.stroke();

    // Typography
    const fontSize = Math.max(28, Math.round(width * 0.045));
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${fontSize}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(title, centerX, centerY - fontSize * 1.5);

    // Dimension stamp banner
    ctx.font = `bold ${Math.round(fontSize * 1.2)}px monospace`;
    ctx.fillStyle = '#67e8f9';
    ctx.fillText(`${width} × ${height} px`, centerX, centerY);

    // Subtitle & explanation
    ctx.font = `500 ${Math.round(fontSize * 0.65)}px sans-serif`;
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(subtitle, centerX, centerY + fontSize * 1.6);

    ctx.font = `400 ${Math.round(fontSize * 0.5)}px sans-serif`;
    ctx.fillStyle = '#cbd5e1';
    ctx.fillText(`Aspect Ratio: ${(width / height).toFixed(4)} : 1`, centerX, centerY + fontSize * 2.5);

    // Safe margins indicator banner
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.fillRect(pad, height - pad - 50, width - pad * 2, 40);
    ctx.font = `600 ${Math.max(12, Math.round(fontSize * 0.4))}px sans-serif`;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.fillText('SMART STANDARD AUTO-CROP TEST MATRIX', centerX, height - pad - 30);

    return canvas.toDataURL('image/png');
  } catch {
    return '';
  }
}

/**
 * Generate a crisp synthetic test canvas with grid lines, gradient, and dimension stamp
 */
function createGeneratedImage(
  width: number,
  height: number,
  title: string,
  subtitle: string,
  theme: 'neon' | 'sunset' | 'ocean' | 'minimal'
): Promise<string> {
  return Promise.resolve(createGeneratedImageSync(width, height, title, subtitle, theme));
}

export const SAMPLE_IMAGES: SampleImageDef[] = [
  {
    id: 'user-prompt-1090x2000',
    name: '1090 × 2000 (User Example)',
    badge: 'Prompt Match',
    width: 1090,
    height: 2000,
    description: 'Exact prompt example: 1090×2000 reduces by width to 1080 and crops to 1080×1920 (9:16).',
    category: 'Vertical Portrait',
    generator: () =>
      createGeneratedImage(
        1090,
        2000,
        'Prompt Reference Image',
        'Tests Smart 9:16 snap to 1080×1920',
        'neon'
      ),
  },
  {
    id: 'photo-landscape-4000x2600',
    name: '4000 × 2600 Landscape',
    badge: 'High-Res Photo',
    width: 4000,
    height: 2600,
    description: 'Ultra high-resolution landscape photo testing downscale to 16:9 (3840×2160 / 1920×1080).',
    category: 'Landscape',
    generator: () =>
      createGeneratedImage(
        4000,
        2600,
        'High-Res Camera Capture',
        'Tests 16:9 & 3:2 landscape downsampling',
        'sunset'
      ),
  },
  {
    id: 'photo-portrait-2400x3200',
    name: '2400 × 3200 3:4 Portrait',
    badge: 'Tablet / Medium',
    width: 2400,
    height: 3200,
    description: 'High-res 3:4 portrait photo. Tests cropping to 4:5 Instagram feed (1080×1350) and 9:16 Stories.',
    category: 'Portrait',
    generator: () =>
      createGeneratedImage(
        2400,
        3200,
        'Medium Format Portrait',
        'Tests 4:5, 9:16 & 1:1 multi-crops',
        'ocean'
      ),
  },
  {
    id: 'square-product-1500x1500',
    name: '1500 × 1500 Square',
    badge: 'Square Asset',
    width: 1500,
    height: 1500,
    description: '1500×1500 square asset testing downscaling to standard 1080×1080 Instagram post.',
    category: 'Square',
    generator: () =>
      createGeneratedImage(
        1500,
        1500,
        'Product & Avatar Matrix',
        'Tests 1:1 downscale & letterboxing',
        'minimal'
      ),
  },
];
