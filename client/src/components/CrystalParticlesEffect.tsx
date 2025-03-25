import { useCallback, useState } from "react";
import { Particles } from "@tsparticles/react";
import { Engine } from "@tsparticles/engine";
import { loadSlim } from "@tsparticles/slim";

interface CrystalParticlesEffectProps {
  color?: string;
  quantity?: number;
  opacity?: number;
  size?: number;
  linkOpacity?: number;
}

const CrystalParticlesEffect = ({
  color = "#8257e6", // Default: purple
  quantity = 40,
  opacity = 0.5,
  size = 4,
  linkOpacity = 0.2
}: CrystalParticlesEffectProps) => {
  const [loaded, setLoaded] = useState(false);

  const particlesInit = useCallback(async (engine: Engine) => {
    await loadSlim(engine);
    setLoaded(true);
  }, []);

  return (
    <Particles
      id="crystal-particles"
      init={particlesInit}
      options={{
        fullScreen: {
          enable: true,
          zIndex: -1
        },
        fpsLimit: 60,
        particles: {
          number: {
            value: quantity,
            density: {
              enable: true,
              value_area: 800
            }
          },
          color: {
            value: color
          },
          shape: {
            type: ["polygon", "edge"],
            polygon: {
              sides: 6, // Hexagon (crystal-like)
              nb_sides: 6
            }
          },
          opacity: {
            value: opacity,
            random: true,
            anim: {
              enable: true,
              speed: 0.5,
              opacity_min: 0.2,
              sync: false
            }
          },
          size: {
            value: size,
            random: true,
            anim: {
              enable: true,
              speed: 1.5,
              size_min: 1,
              sync: false
            }
          },
          rotate: {
            value: 0,
            random: true,
            direction: "clockwise",
            animation: {
              enable: true,
              speed: 3,
              sync: false
            }
          },
          links: {
            enable: true,
            distance: 150,
            color: color,
            opacity: linkOpacity,
            width: 1
          },
          move: {
            enable: true,
            speed: 0.7,
            direction: "none",
            random: true,
            straight: false,
            outModes: "out",
            attract: {
              enable: true,
              rotateX: 600,
              rotateY: 1200
            }
          }
        },
        interactivity: {
          detectsOn: "canvas",
          events: {
            onHover: {
              enable: true,
              mode: "grab"
            },
            onClick: {
              enable: true,
              mode: "push"
            },
            resize: true
          },
          modes: {
            grab: {
              distance: 140,
              links: {
                opacity: 0.7
              }
            },
            push: {
              quantity: 4
            }
          }
        },
        detectRetina: true,
        background: {
          color: "transparent",
          image: "",
          position: "50% 50%",
          repeat: "no-repeat",
          size: "cover"
        }
      }}
    />
  );
};

export default CrystalParticlesEffect;