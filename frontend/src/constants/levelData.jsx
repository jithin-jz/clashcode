import React from "react";
import {
  Terminal,
  Box,
  Binary,
  Keyboard,
  GitGraph,
  Repeat,
  List,
  FunctionSquare,
  Book,
  Package,
  FileText,
  LayoutTemplate,
  AlertTriangle,
  BoxSelect,
  Rocket,
  Code,
  Crown,
  Shield,
  Zap,
  Target,
  Flag,
  Map,
  Compass,
  Scroll,
} from "lucide-react";

export const ICONS = [
  <Terminal size={24} />,
  <Box size={24} />,
  <Binary size={24} />,
  <Keyboard size={24} />,
  <GitGraph size={24} />,
  <Repeat size={24} />,
  <List size={24} />,
  <FunctionSquare size={24} />,
  <Book size={24} />,
  <Package size={24} />,
  <FileText size={24} />,
  <LayoutTemplate size={24} />,
  <AlertTriangle size={24} />,
  <BoxSelect size={24} />,
  <Rocket size={24} />,
  <Code size={24} />,
  <Shield size={24} />,
  <Zap size={24} />,
  <Target size={24} />,
  <Flag size={24} />,
  <Map size={24} />,
  <Compass size={24} />,
  <Scroll size={24} />,
  <Crown size={24} />,
];

// Procedural Spiral Generator (Inward Winding)
export const generateLevels = (count = 60) => {
  const levels = [];

  // 1. Generate Spiral Coordinates (Outwards from (0,0))
  // Index 0 = center, higher indices = outer ring
  const coords = [];
  let x = 0;
  let y = 0;
  let dx = 0;
  let dy = -1;

  // Generate one extra point so Level 1 starts at "Level 2's" spot
  // leaving the outermost corner empty.
  const numPoints = count + 1;

  for (let i = 0; i < numPoints; i++) {
    coords.push({ x, y });

    if (x === y || (x < 0 && x === -y) || (x > 0 && x === 1 - y)) {
      const temp = dx;
      dx = -dy;
      dy = temp;
    }

    x += dx;
    y += dy;
  }

  // 2. Rotate/Flip to ensure the LAST point (The Empty Corner) is at Bottom-Right (+X, +Y)
  // First, Transpose (Swap X/Y) to ensure Level 1 is to the LEFT of the corner, not ABOVE.
  const rotatedCoords = coords.map((p) => ({ x: p.y, y: p.x }));

  const lastPoint = rotatedCoords[numPoints - 1];

  // Determine required flips
  // We want lastPoint.x > 0 and lastPoint.y > 0
  const flipX = lastPoint.x < 0 ? -1 : 1;
  const flipY = lastPoint.y < 0 ? -1 : 1;

  const transformedCoords = rotatedCoords.map((p) => ({
    x: p.x * flipX,
    y: p.y * flipY,
  }));

  // 3. Normalize Coordinates to %
  let minX = 0,
    maxX = 0,
    minY = 0,
    maxY = 0;
  transformedCoords.forEach((p) => {
    if (p.x < minX) minX = p.x;
    if (p.x > maxX) maxX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.y > maxY) maxY = p.y;
  });

  const rangeX = Math.max(maxX - minX, 1);
  const rangeY = Math.max(maxY - minY, 1);

  // Tighter padding: 5% to 95% (Use 90% width/height)
  // Tighter padding: 10% to 90% (Range 80%)
  const scaleX = 80 / rangeX;
  const scaleY = 80 / rangeY;

  // 4. Construct Levels (Reversed Mapping)

  for (let i = 0; i < count; i++) {
    const id = i + 1;
    // Level 1 gets index 49
    const coordIndex = count - id;
    const pos = transformedCoords[coordIndex];

    // Map to percentage (10% to 90%)
    const posX = 10 + (pos.x - minX) * scaleX;
    const posY = 10 + (pos.y - minY) * scaleY;

    levels.push({
      id: id,
      order: id,
      name: `Level ${id}`,
      icon: ICONS[(id - 1) % ICONS.length],
      stars: 0,
      unlocked: id === 1,
      hasGift: false,
      position: { x: posX, y: posY },
    });
  }

  return levels;
};
