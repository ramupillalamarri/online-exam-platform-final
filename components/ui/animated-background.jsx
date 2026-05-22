"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"


function FloatingOrb({ className = "", delay = 0, duration = 20, size = "md" }) {
  const sizes = {
    sm: "w-24 h-24",
    md: "w-40 h-40",
    lg: "w-64 h-64",
    xl: "w-96 h-96",
  }

  return (
    <motion.div
      className={`absolute rounded-full blur-3xl ${sizes[size]} ${className}`}
      animate={{
        y: [0, -40, 0, 30, 0],
        x: [0, 30, -20, 10, 0],
        scale: [1, 1.2, 0.9, 1.1, 1],
        rotate: [0, 5, -5, 3, 0],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  )
}

function MorphingBlob({ className = "", delay = 0 }) {
  return (
    <motion.div
      className={`absolute animate-morph ${className}`}
      animate={{
        scale: [1, 1.1, 0.95, 1.05, 1],
        rotate: [0, 90, 180, 270, 360],
      }}
      transition={{
        duration: 20,
        delay,
        repeat: Infinity,
        ease: "linear",
      }}
    />
  )
}


export function AnimatedBackground({ variant = "default", children }) {
  const opacityClass = {
    default: "opacity-40",
    subtle: "opacity-25",
    vibrant: "opacity-60",
    hero: "opacity-50",
  }

  return (
    <div className="relative overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5" />
      
      {/* Morphing gradient overlay */}
      <motion.div
        className="absolute inset-0 opacity-30"
        animate={{
          background: [
            "radial-gradient(circle at 20% 30%, var(--glow-1) 0%, transparent 50%)",
            "radial-gradient(circle at 80% 70%, var(--glow-2) 0%, transparent 50%)",
            "radial-gradient(circle at 50% 50%, var(--glow-3) 0%, transparent 50%)",
            "radial-gradient(circle at 20% 30%, var(--glow-1) 0%, transparent 50%)",
          ],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
      />
      
      {/* Floating orbs */}
      <div className={`absolute inset-0 ${opacityClass[variant]}`}>
        <FloatingOrb
          className="bg-glow-1 top-[10%] -left-20"
          delay={0}
          duration={25}
          size="xl"
        />
        <FloatingOrb
          className="bg-glow-2 top-[40%] right-[-10%]"
          delay={3}
          duration={22}
          size="lg"
        />
        <FloatingOrb
          className="bg-glow-3 bottom-[20%] left-[20%]"
          delay={6}
          duration={28}
          size="lg"
        />
        <FloatingOrb
          className="bg-glow-4 top-[5%] right-[20%]"
          delay={9}
          duration={20}
          size="md"
        />
        <FloatingOrb
          className="bg-glow-5 bottom-[10%] right-[30%]"
          delay={12}
          duration={24}
          size="md"
        />
        <MorphingBlob
          className="bg-gradient-to-br from-glow-1/30 to-glow-2/30 w-80 h-80 top-[60%] left-[5%] blur-3xl"
          delay={2}
        />
        <MorphingBlob
          className="bg-gradient-to-br from-glow-3/30 to-glow-4/30 w-96 h-96 top-[10%] right-[10%] blur-3xl"
          delay={5}
        />
      </div>

      {/* Animated mesh gradient */}
      <div className="absolute inset-0 opacity-[0.03]">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="currentColor" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" className="text-foreground" />
        </svg>
      </div>

      {/* Noise texture */}
      <div className="absolute inset-0 noise-overlay" />

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  )
}

export function FloatingShapes() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Large rotating ring */}
      <motion.div
        className="absolute top-[15%] left-[8%] w-32 h-32 border-2 border-primary/10 rounded-full"
        animate={{ rotate: 360 }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
      />
      
      {/* Bouncing circles */}
      <motion.div
        className="absolute top-[25%] right-[12%] w-6 h-6 bg-gradient-to-br from-primary/30 to-glow-2/30 rounded-full"
        animate={{ y: [0, -20, 0], scale: [1, 1.2, 1] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-[45%] left-[5%] w-4 h-4 bg-gradient-to-br from-accent/40 to-glow-3/40 rounded-full"
        animate={{ y: [0, -15, 0], x: [0, 10, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />
      
      {/* Spinning squares */}
      <motion.div
        className="absolute top-[60%] right-[8%] w-8 h-8 border-2 border-accent/20 rounded-lg"
        animate={{ rotate: [0, 180, 360], scale: [1, 1.1, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-[25%] left-[15%] w-5 h-5 bg-primary/15 rounded"
        animate={{ rotate: [45, 225, 45], y: [0, -25, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
      
      {/* Pulsing rings */}
      <motion.div
        className="absolute top-[35%] right-[25%] w-12 h-12 border border-glow-1/20 rounded-full"
        animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-[40%] left-[25%] w-16 h-16 border border-glow-2/20 rounded-full"
        animate={{ scale: [1, 1.4, 1], opacity: [0.2, 0.5, 0.2] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />
      
      {/* Floating diamonds */}
      <motion.div
        className="absolute top-[70%] right-[35%] w-6 h-6 bg-gradient-to-br from-glow-4/30 to-glow-5/30 rotate-45"
        animate={{ y: [0, -30, 0], rotate: [45, 135, 45] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      />
      
      {/* Orbit circles */}
      <div className="absolute top-[50%] left-[50%] w-0 h-0">
        <motion.div
          className="absolute w-3 h-3 bg-primary/30 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: "80px 0px" }}
        />
        <motion.div
          className="absolute w-2 h-2 bg-accent/30 rounded-full"
          animate={{ rotate: -360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: "120px 0px" }}
        />
      </div>
      
      {/* Hexagons */}
      <motion.div
        className="absolute bottom-[15%] right-[15%] w-10 h-10"
        animate={{ rotate: [0, 60, 0], y: [0, -15, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      >
        <svg viewBox="0 0 24 24" className="w-full h-full text-primary/15">
          <polygon fill="currentColor" points="12,2 22,8.5 22,15.5 12,22 2,15.5 2,8.5"/>
        </svg>
      </motion.div>
      
      {/* Plus signs */}
      <motion.div
        className="absolute top-[20%] left-[30%] text-2xl text-primary/10 font-light"
        animate={{ rotate: [0, 90, 0], scale: [1, 1.2, 1] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        +
      </motion.div>
      <motion.div
        className="absolute bottom-[35%] right-[20%] text-xl text-accent/15 font-light"
        animate={{ rotate: [0, -90, 0], scale: [1, 1.3, 1] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      >
        +
      </motion.div>
    </div>
  )
}

export function GlowingDots() {
  const [dots, setDots] = useState([])
  useEffect(() => {
    const colors = ["bg-primary/50", "bg-accent/50", "bg-glow-1/60", "bg-glow-2/60", "bg-glow-3/60"]
    const generatedDots = Array.from({ length: 40 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      delay: Math.random() * 5,
      duration: 2 + Math.random() * 4,
      size: 2 + Math.random() * 4,
      color: colors[Math.floor(Math.random() * colors.length)],
    }))
    setDots(generatedDots)
  }, [])

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {dots.map((dot) => (
        <motion.div
          key={dot.id}
          className={`absolute rounded-full ${dot.color}`}
          style={{ 
            left: dot.left, 
            top: dot.top,
            width: dot.size,
            height: dot.size,
          }}
          animate={{ 
            opacity: [0.2, 0.8, 0.2], 
            scale: [1, 1.8, 1],
            y: [0, -10, 0],
          }}
          transition={{
            duration: dot.duration,
            delay: dot.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  )
}

export function ParticleField() {
  const [particles, setParticles] = useState([])

  useEffect(() => {
    const generatedParticles = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 1 + Math.random() * 2,
      duration: 10 + Math.random() * 20,
      delay: Math.random() * 10,
    }))
    setParticles(generatedParticles)
  }, [])

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute bg-foreground/10 rounded-full"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size,
          }}
          animate={{
            y: [0, -200],
            x: [0, Math.random() * 50 - 25],
            opacity: [0, 0.5, 0],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}
    </div>
  )
}

export function WaveBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <svg
        className="absolute bottom-0 left-0 w-full h-64 opacity-10"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
      >
        <motion.path
          fill="currentColor"
          className="text-primary"
          animate={{
            d: [
              "M0,160L48,176C96,192,192,224,288,213.3C384,203,480,149,576,133.3C672,117,768,139,864,165.3C960,192,1056,224,1152,213.3C1248,203,1344,149,1392,122.7L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z",
              "M0,192L48,170.7C96,149,192,107,288,117.3C384,128,480,192,576,213.3C672,235,768,213,864,181.3C960,149,1056,107,1152,101.3C1248,96,1344,128,1392,144L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z",
              "M0,160L48,176C96,192,192,224,288,213.3C384,203,480,149,576,133.3C672,117,768,139,864,165.3C960,192,1056,224,1152,213.3C1248,203,1344,149,1392,122.7L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z",
            ],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
      </svg>
      <svg
        className="absolute bottom-0 left-0 w-full h-48 opacity-5"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
      >
        <motion.path
          fill="currentColor"
          className="text-accent"
          animate={{
            d: [
              "M0,64L48,96C96,128,192,192,288,197.3C384,203,480,149,576,117.3C672,85,768,75,864,101.3C960,128,1056,192,1152,197.3C1248,203,1344,149,1392,122.7L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z",
              "M0,128L48,117.3C96,107,192,85,288,106.7C384,128,480,192,576,202.7C672,213,768,171,864,144C960,117,1056,107,1152,128C1248,149,1344,203,1392,229.3L1440,256L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z",
              "M0,64L48,96C96,128,192,192,288,197.3C384,203,480,149,576,117.3C672,85,768,75,864,101.3C960,128,1056,192,1152,197.3C1248,203,1344,149,1392,122.7L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z",
            ],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
      </svg>
    </div>
  )
}

export function Sparkles({ count = 20 }) {
  const [sparkles, setSparkles] = useState([])

  useEffect(() => {
    const generated = Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 4 + Math.random() * 8,
      delay: Math.random() * 3,
    }))
    setSparkles(generated)
  }, [count])

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {sparkles.map((sparkle) => (
        <motion.div
          key={sparkle.id}
          className="absolute"
          style={{
            left: `${sparkle.x}%`,
            top: `${sparkle.y}%`,
          }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
            rotate: [0, 180],
          }}
          transition={{
            duration: 2,
            delay: sparkle.delay,
            repeat: Infinity,
            repeatDelay: 3,
          }}
        >
          <svg
            width={sparkle.size}
            height={sparkle.size}
            viewBox="0 0 24 24"
            className="text-primary/40"
          >
            <path
              fill="currentColor"
              d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z"
            />
          </svg>
        </motion.div>
      ))}
    </div>
  )
}

