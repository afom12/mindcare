import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const slides = [
  {
    icon: "🌿",
    title: "breathe.",
    description: "a quiet space to untangle your thoughts",
    gradient: "from-emerald-400/20 to-teal-400/20"
  },
  {
    icon: "🫧",
    title: "unwind.",
    description: "where every feeling finds a friendly ear",
    gradient: "from-blue-400/20 to-cyan-400/20"
  },
  {
    icon: "✨",
    title: "you matter.",
    description: "small steps toward feeling better",
    gradient: "from-violet-400/20 to-purple-400/20"
  }
];

export default function Onboarding() {
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 20,
        y: (e.clientY / window.innerHeight) * 20
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const nextSlide = () => {
    if (index === slides.length - 1) {
      navigate("/register");
    } else {
      setIndex(index + 1);
    }
  };

  const skip = () => navigate("/login");

  return (
    <div className="relative min-h-screen bg-slate-50 overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob" />
        <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000" />
      </div>

      {/* Subtle parallax effect */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `radial-gradient(circle at 50% 50%, black 1px, transparent 1px)`,
          backgroundSize: "50px 50px",
          transform: `translate(${mousePosition.x}px, ${mousePosition.y}px)`
        }}
      />

      {/* Main content */}
      <div className="relative z-10 min-h-screen flex flex-col lg:flex-row">
        {/* Left side - Minimal branding */}
        <div className="lg:w-1/2 p-8 lg:p-16 flex flex-col justify-between">
          <div>
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-sm font-medium text-slate-400 tracking-wider mb-12"
            >
              MINDCARE
            </motion.div>

            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-8"
            >
              <div className="text-8xl mb-6">{slides[index].icon}</div>
              <h1 className="text-5xl lg:text-6xl font-light text-slate-800 tracking-tight">
                {slides[index].title}
              </h1>
              <p className="text-lg text-slate-500 max-w-sm leading-relaxed">
                {slides[index].description}
              </p>
            </motion.div>
          </div>

          {/* Progress indicators - Minimal */}
          <div className="flex items-center gap-4 mt-12 lg:mt-0">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                className="group flex items-center gap-2"
              >
                <div
                  className={`h-0.5 transition-all duration-500 ${
                    i === index
                      ? "w-12 bg-slate-800"
                      : i < index
                        ? "w-8 bg-slate-300"
                        : "w-8 bg-slate-200 group-hover:bg-slate-300"
                  }`}
                />
                <span
                  className={`text-xs ${
                    i === index ? "text-slate-800" : "text-slate-400"
                  }`}
                >
                  0{i + 1}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Right side - Interactive area */}
        <div className="lg:w-1/2 flex items-center justify-center p-8 lg:p-16">
          <div className="w-full max-w-md space-y-8">
            {/* Floating card */}
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative"
            >
              <div
                className={`absolute inset-0 bg-gradient-to-r ${slides[index].gradient} rounded-3xl blur-2xl`}
              />
              <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-white/50">
                <div className="space-y-4">
                  <p className="text-slate-600 text-lg leading-relaxed">
                    {index === 0 &&
                      "thoughts floating like clouds — here, they can simply drift by."}
                    {index === 1 &&
                      "no judgment, no rush. just someone (something?) who listens."}
                    {index === 2 &&
                      "the bravest thing you can do is ask for help. you already have."}
                  </p>

                  {/* Gentle CTA */}
                  <div className="pt-6">
                    <button
                      onClick={nextSlide}
                      className="group relative w-full"
                    >
                      <div className="absolute inset-0 bg-slate-800 rounded-xl blur opacity-20 group-hover:opacity-30 transition" />
                      <div className="relative bg-slate-800 text-white py-4 px-6 rounded-xl font-medium text-sm tracking-wide hover:bg-slate-700 transition-all duration-300">
                        {index === slides.length - 1
                          ? "begin gently →"
                          : "continue →"}
                      </div>
                    </button>
                  </div>

                  {/* Try anonymously - visible on every slide */}
                  <div className="text-center pt-4 space-y-2">
                    <button
                      onClick={() => navigate("/chat")}
                      className="block w-full text-sm text-slate-500 hover:text-slate-700 transition-colors duration-300"
                    >
                      try anonymously →
                    </button>
                    <button
                      onClick={skip}
                      className="text-sm text-slate-400 hover:text-slate-600 transition-colors duration-300"
                    >
                      already have an account? sign in
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Gentle reminder */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-xs text-center text-slate-400"
            >
              a gentle companion, not a therapist
            </motion.p>
          </div>
        </div>
      </div>
    </div>
  );
}
