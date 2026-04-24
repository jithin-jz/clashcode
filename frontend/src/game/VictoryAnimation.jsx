import React, { useEffect, useRef } from "react";

const VictoryAnimation = ({ type }) => {
  const canvasRef = useRef(null);
  const particles = useRef([]);

  useEffect(() => {
    if (!type || type === "default") return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let animationFrameId;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const createConfetti = () => {
      const count = 100;
      for (let i = 0; i < count; i++) {
        particles.current.push({
          x: Math.random() * canvas.width,
          y: -10,
          vx: (Math.random() - 0.5) * 10,
          vy: Math.random() * 15 + 5,
          life: 1.0,
          color: `hsl(${Math.random() * 360}, 100%, 50%)`,
          size: Math.random() * 8 + 4,
          type: "confetti",
          rotation: Math.random() * 360,
          rSpeed: Math.random() * 10 - 5,
        });
      }
    };

    const createFirework = (x, y) => {
      const count = 150;
      const hue = Math.random() * 360;
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 8 + 2;
        particles.current.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 1.0,
          color: `hsl(${hue}, 100%, 60%)`,
          size: Math.random() * 3 + 1,
          type: "firework",
        });
      }
    };

    const createLevelUp = () => {
      // Central burst of gold circles
      const count = 200;
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 12 + 5;
        particles.current.push({
          x: canvas.width / 2,
          y: canvas.height / 2,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 1.5,
          color: i % 2 === 0 ? "#ffa116" : "#FFFFFF",
          size: Math.random() * 6 + 2,
          type: "levelup",
        });
      }
    };

    if (type === "confetti") createConfetti();
    if (type === "levelup") createLevelUp();

    const loop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (type === "fireworks" && Math.random() < 0.08) {
        createFirework(
          Math.random() * canvas.width,
          Math.random() * canvas.height * 0.7,
        );
      }

      particles.current.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.type === "confetti") {
          p.vy += 0.2; // Gravity
          p.rotation += p.rSpeed;
          p.life -= 0.005;
        } else if (p.type === "firework") {
          p.vy += 0.1;
          p.life -= 0.015;
        } else if (p.type === "levelup") {
          p.vx *= 0.98;
          p.vy *= 0.98;
          p.life -= 0.01;
        }

        if (p.life <= 0) {
          particles.current.splice(i, 1);
          return;
        }

        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;

        if (p.type === "confetti") {
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size / 2);
          ctx.restore();
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
      });
      ctx.globalAlpha = 1;

      animationFrameId = requestAnimationFrame(loop);
    };
    loop();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [type]);

  if (!type || type === "default") return null;

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-60"
    />
  );
};

export default VictoryAnimation;
