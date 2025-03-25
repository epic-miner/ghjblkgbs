import { useEffect, useRef } from 'react';

interface CrystalOptions {
  count?: number;
  color?: string;
  size?: {
    min: number;
    max: number;
  };
  speed?: number;
  shine?: boolean;
  connectLines?: boolean;
  opacity?: number;
  polygonSides?: number; // Number of sides for crystal shapes
}

interface CrystalParticlesProps {
  options?: CrystalOptions;
}

const CrystalParticles = ({ 
  options = {} 
}: CrystalParticlesProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Configure crystal particles with defaults or custom options
    const count = options.count || 30;
    const color = options.color || '#8257e6'; // Purple/violet default
    const minSize = options.size?.min || 3;
    const maxSize = options.size?.max || 8;
    const speed = options.speed || 0.5;
    const shine = options.shine !== undefined ? options.shine : true;
    const connectLines = options.connectLines !== undefined ? options.connectLines : true;
    const baseOpacity = options.opacity || 0.7;
    const polygonSides = options.polygonSides || 6; // Hexagons by default (crystal-like)
    
    // Handle canvas resize
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    window.addEventListener('resize', handleResize);
    handleResize();
    
    // Create crystal particles
    const particles: Array<{
      x: number;
      y: number;
      size: number;
      dirX: number;
      dirY: number;
      color: string;
      opacity: number;
      rotation: number;
      rotationSpeed: number;
      sides: number;
    }> = [];
    
    // Create particles
    for (let i = 0; i < count; i++) {
      const size = Math.random() * (maxSize - minSize) + minSize;
      const opacity = Math.random() * baseOpacity + (baseOpacity * 0.3);
      
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size,
        dirX: (Math.random() - 0.5) * speed,
        dirY: (Math.random() - 0.5) * speed,
        color,
        opacity,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.01,
        sides: polygonSides,
      });
    }
    
    // Function to draw a polygon (crystal)
    const drawPolygon = (
      ctx: CanvasRenderingContext2D, 
      x: number, 
      y: number, 
      radius: number, 
      sides: number, 
      rotation: number
    ) => {
      ctx.beginPath();
      for (let i = 0; i < sides; i++) {
        const angle = rotation + (i * 2 * Math.PI / sides);
        const px = x + radius * Math.cos(angle);
        const py = y + radius * Math.sin(angle);
        if (i === 0) {
          ctx.moveTo(px, py);
        } else {
          ctx.lineTo(px, py);
        }
      }
      ctx.closePath();
    };
    
    // Draw shine effect for crystal
    const drawShine = (
      ctx: CanvasRenderingContext2D, 
      x: number, 
      y: number, 
      radius: number, 
      opacity: number,
      rotation: number
    ) => {
      // Create linear gradient for shine effect
      const gradient = ctx.createLinearGradient(
        x - radius, y - radius, 
        x + radius, y + radius
      );
      
      // Extract color components
      const hexToRgb = (hex: string) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16)
        } : {r: 255, g: 255, b: 255};
      };
      
      const rgb = hexToRgb(color);
      
      gradient.addColorStop(0, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity * 0.3})`);
      gradient.addColorStop(0.5, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`);
      gradient.addColorStop(1, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity * 0.3})`);
      
      ctx.fillStyle = gradient;
      
      // Draw a small polygonal shape offset from the main crystal
      const shineSize = radius * 0.7;
      const shineOffset = radius * 0.3;
      
      // Rotation for shine is offset from the main crystal
      const shineRotation = rotation + Math.PI / 4;
      
      ctx.save();
      ctx.translate(
        x + Math.cos(shineRotation) * shineOffset, 
        y + Math.sin(shineRotation) * shineOffset
      );
      
      drawPolygon(ctx, 0, 0, shineSize, 3, shineRotation);
      ctx.fill();
      ctx.restore();
    };
    
    // Animation function
    const animate = () => {
      requestAnimationFrame(animate);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw connection lines between particles
      if (connectLines) {
        for (let i = 0; i < particles.length; i++) {
          for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 150) {
              const opacity = (1 - distance / 150) * 0.3 * 
                Math.min(particles[i].opacity, particles[j].opacity);
              
              // Calculate color based on the particle color
              const hexToRgb = (hex: string) => {
                const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
                return result ? {
                  r: parseInt(result[1], 16),
                  g: parseInt(result[2], 16),
                  b: parseInt(result[3], 16)
                } : {r: 255, g: 255, b: 255};
              };
              
              const rgb = hexToRgb(color);
              
              ctx.beginPath();
              ctx.moveTo(particles[i].x, particles[i].y);
              ctx.lineTo(particles[j].x, particles[j].y);
              ctx.strokeStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`;
              ctx.lineWidth = 0.5;
              ctx.stroke();
            }
          }
        }
      }
      
      // Update and draw particles
      particles.forEach(p => {
        // Move particles
        p.x += p.dirX;
        p.y += p.dirY;
        p.rotation += p.rotationSpeed;
        
        // Bounce off edges
        if (p.x < 0 || p.x > canvas.width) p.dirX *= -1;
        if (p.y < 0 || p.y > canvas.height) p.dirY *= -1;
        
        // Draw crystal shape (polygon)
        drawPolygon(ctx, p.x, p.y, p.size, p.sides, p.rotation);
        
        // Extract color
        const hexToRgb = (hex: string) => {
          const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
          return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
          } : {r: 255, g: 255, b: 255};
        };
        
        const rgb = hexToRgb(p.color);
        
        // Fill with color and opacity
        ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${p.opacity})`;
        ctx.fill();
        
        // Add shine effect if enabled
        if (shine) {
          drawShine(ctx, p.x, p.y, p.size, p.opacity, p.rotation);
        }
      });
    };
    
    // Start animation
    animate();
    
    // Cleanup function
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [options]);
  
  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10 w-full h-full"
      style={{ 
        pointerEvents: 'none',
        willChange: 'transform, opacity'
      }}
    />
  );
};

export default CrystalParticles;