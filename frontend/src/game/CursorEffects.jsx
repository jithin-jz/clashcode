import React, { useEffect, useRef } from "react";

const CursorEffects = ({ effectType }) => {
  const canvasRef = useRef(null);
  const particles = useRef([]);

  useEffect(() => {
    if (!effectType) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let animationFrameId;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Loop
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.current.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.02;

        if (p.type === "matrix") {
          p.y += 2;
        } else {
          p.size *= 0.96;
        }

        if (p.life <= 0) {
          particles.current.splice(i, 1);
          return;
        }

        ctx.globalAlpha = p.life;
        if (p.type === "matrix") {
          ctx.font = `${p.size}px monospace`;
          ctx.fillStyle = p.color;
          ctx.fillText(p.char, p.x, p.y);
        } else {
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
      });
      ctx.globalAlpha = 1;

      animationFrameId = requestAnimationFrame(render);
    };
    render();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [effectType]);

  // Expose spawn method
  useEffect(() => {
    const effect_key = effectType; // Use effectType passed from parent
    window.spawnCursorEffect = (x, y) => {
      if (effect_key === "sparkle") {
        for (let i = 0; i < 5; i++) {
          particles.current.push({
            x,
            y,
            vx: (Math.random() - 0.5) * 3,
            vy: (Math.random() - 0.5) * 3,
            life: 1.0,
            color: `hsl(50, 100%, ${80 + Math.random() * 20}%)`,
            size: Math.random() * 4 + 1,
            type: "sparkle",
          });
        }
      } else if (effect_key === "rainbow") {
        for (let i = 0; i < 4; i++) {
          particles.current.push({
            x,
            y,
            vx: (Math.random() - 0.5) * 5,
            vy: (Math.random() - 0.5) * 5,
            life: 1.0,
            color: `hsl(${Math.random() * 360}, 100%, 50%)`,
            size: Math.random() * 5 + 2,
            type: "rainbow",
          });
        }
      } else if (effect_key === "matrix") {
        particles.current.push({
          x,
          y,
          vx: 0,
          vy: 2,
          life: 1.5,
          color: "#00ff41",
          size: 14,
          char: String.fromCharCode(0x30a0 + Math.random() * 96),
          type: "matrix",
        });
      }
    };

    return () => {
      delete window.spawnCursorEffect;
    };
  }, [effectType]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-50"
    />
  );
};

export default CursorEffects;
