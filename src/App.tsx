/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Mail,
  Phone,
  MapPin,
  Linkedin,
  ExternalLink,
  Camera,
  Video,
  Layers,
  ShoppingBag,
  Github,
  Award,
  BookOpen,
  Briefcase,
  X,
  PlayCircle,
  Play,
  Palette,
  Globe,
  Copy,
  Check,
  Brain,
  Star,
  Sparkles,
  ArrowRight,
  MessageSquare,
  Zap,
  Coffee,
  Users,
  Footprints,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Layout,
  Send,
  Heart,
  MessageCircle,
  Bookmark,
  Share2,
  BarChart3,
  Loader2,
  Type,
  AudioLines,
  Quote,
  Lightbulb,
} from "lucide-react";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 },
};

interface Project {
  id: string;
  title: string;
  company: string;
  description: string;
  longDescription: string;
  category: string;
  icon: any;
  color: string;
  tasks: string[];
}

type ViewState = "home" | "career" | "portfolio-hub" | "portfolio-detail";

export default function App() {
  const [view, setView] = useState<ViewState>("home");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isVideoPlaying2, setIsVideoPlaying2] = useState(false);
  const [isVideoPlaying3, setIsVideoPlaying3] = useState(false);
  const [cinemaModeVideo, setCinemaModeVideo] = useState<string | null>(null);
  const [selectedPreviewImage, setSelectedPreviewImage] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoRef2 = useRef<HTMLVideoElement>(null);
  const videoRef3 = useRef<HTMLVideoElement>(null);

  // ATM Generator State
  const [tiktokUrl, setTiktokUrl] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [atmResult, setAtmResult] = useState<{
    original: string;
    atm: string;
    hook: string;
    structure: string;
    brief?: {
      voiceOver: string;
      onScreenText: string;
      locations: string;
      sequence: string;
      shotList: string;
      editingNotes: {
        music: string;
        transitions: string;
        subtitles: string;
        pace: string;
        effects: string;
      };
    };
    metadata: any;
    modifikasi?: {
      recommendedHook: string;
      strategies: string[];
    };
  } | null>(null);

  const handleAtmGenerator = async () => {
    if (!tiktokUrl) return;
    setIsGenerating(true);
    setAtmResult(null);
    setVideoError(false);

    try {
      // 1. Fetch metadata via server proxy
      const response = await fetch(
        `/api/tiktok-proxy?url=${encodeURIComponent(tiktokUrl)}`,
      );
      const data = await response.json();

      if (data.error) throw new Error(data.error);

      // 2. Fetch media content for analysis
      const mediaResponse = await fetch(
        `/api/proxy-media?url=${encodeURIComponent(data.videoUrl)}`,
      );
      const mediaData = await mediaResponse.json();

      if (!mediaData.data)
        throw new Error("Could not download video for analysis");

      // 3. Call Gemini generation directly from frontend with video content
      const prompt = `
        Tugas Anda adalah menjadi ahli strategi konten dan transkriptor video profesional.
        Saya memberikan video TikTok dengan deskripsi: "${data.description}" oleh ${data.author?.nickname || "Unknown Creator"}.
        
        TASK:
        1. "Original Transcript": Dengarkan audio video dan tuliskan transkripnya secara VERBATIM (kata demi kata) sesuai dengan apa yang benar-benar diucapkan dalam video tersebut. Jangan hanya menebak dari deskripsi.
        2. "ATM Script": Buat naskah "Amati, Tiru, Modifikasi" yang merupakan versi yang lebih dioptimalkan untuk engagement tinggi, hook lebih tajam, dan CTA (Call to Action) yang lebih persuasif.
        3. Identifikasi "Hook Strategy" (contoh: Curiosity Hook, Problem/Solution, Visual Shock, dll).
        4. Tentukan "Video Structure" (contoh: Hook -> Value -> CTA).
        5. "Content Brief Outline": Buat panduan produksi lengkap yang SANGAT DETAIL untuk naskah ATM tersebut.
        6. "Modifikasi Overview": Berikan rekomendasi hook yang lebih kuat ("Recommended Hook") dan rincian strategi peningkatan ("Strategi Peningkatan" - minimal 4 poin).
        
        PENTING: Transkrip asli HARUS akurat sesuai narasi suara di video.
        
        Kembalikan hasil dalam format JSON murni:
        {
          "original": "Isi transkrip asli yang akurat...",
          "atm": "Isi naskah ATM...",
          "hook": "Jenis Strategi Hook",
          "structure": "Alur Struktur Video",
          "modifikasi": {
            "recommendedHook": "Teks naskah hook yang sangat kuat",
            "strategies": ["Strategi 1", "Strategi 2", "Strategi 3", "Strategi 4"]
          },
          "brief": {
            "voiceOver": "Salinan narasi lengkap (sama dengan ATM Script)",
            "onScreenText": "Daftar teks yang harus muncul di layar per adegan. Gunakan format 'Teks Overlay | Tips: Catatan kemunculan' per baris. (Contoh: 'SANDAL KAMPUS 40RB-AN?! | Tips: Muncul di 2 detik pertama')",
            "locations": "Detail lokasi pengambilan gambar (WAJIB gunakan bullet points • per baris)",
            "sequence": "Langkah-langkah detail urutan pengambilan gambar Scene 1 s/d selesai. WAJIB gunakan format 'Judul Scene | Deskripsi adegan' per baris. (Contoh: 'Opening | Footage kaki sedang memakai sandal')",
            "shotList": "Instruksi kamera detail (angle, movement, lens feel) (WAJIB gunakan bullet points • per baris)",
            "editingNotes": {
              "music": "Referensi musik spesifik",
              "transitions": "Detail teknik transisi",
              "subtitles": "Font & animasi subtitle",
              "pace": "Rincian ritme potongan video",
              "effects": "Visual effects atau filter yang dibutuhkan"
            }
          }
        }
      `;

      const aiResponse = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: {
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: mediaData.mimeType || "video/mp4",
                data: mediaData.data,
              },
            },
          ],
        },
      });

      const outputText = aiResponse.text;
      if (!outputText) throw new Error("AI returned empty response");

      const cleanJson = outputText.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(cleanJson);

      setAtmResult({
        original: parsed.original,
        atm: parsed.atm,
        hook: parsed.hook,
        structure: parsed.structure,
        brief: parsed.brief,
        modifikasi: parsed.modifikasi,
        metadata: data,
      });
    } catch (error) {
      console.error("ATM Generation Error:", error);
      alert(
        "Failed to generate ATM script. Please try a different public TikTok link.",
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePlayVideo = () => {
    if (videoRef.current) {
      videoRef.current.play();
      setIsVideoPlaying(true);
    }
  };

  const handlePlayVideo2 = () => {
    if (videoRef2.current) {
      videoRef2.current.play();
      setIsVideoPlaying2(true);
    }
  };

  const handlePlayVideo3 = () => {
    if (videoRef3.current) {
      videoRef3.current.play();
      setIsVideoPlaying3(true);
    }
  };

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  const projects: Project[] = [
    {
      id: "social-mcn",
      title: "Daily Social Media Content",
      company: "PT. Joy Play Culture",
      description:
        "Graphic design and video editing for Instagram & TikTok MCN ecosystems.",
      longDescription:
        "As a Graphic Designer for an MCN, I was responsible for the end-to-end creation of social media assets that drove daily engagement across major platforms.",
      category: "Content Creation",
      icon: Palette,
      color: "from-purple-500 to-pink-500",
      tasks: [
        "Designing daily Instagram post content",
        "Creating thumbnails for daily TikTok content",
        "Shooting and editing Reels & TikTok videos",
        "Assisting in designing client proposals",
      ],
    },
    {
      id: "shopify-support",
      title: "Shopify Store Management",
      company: "PT. Hendratama Anugrah Cipta",
      description:
        "Customized storefronts and optimized e-commerce landing pages.",
      longDescription:
        "Focused on improving the user experience and visual appeal of Shopify-based online stores through professional design and content structure.",
      category: "E-Commerce",
      icon: ShoppingBag,
      color: "from-green-500 to-emerald-500",
      tasks: [
        "Uploaded products with optimized descriptions",
        "Created website content for FAQ & Policy pages",
        "Designed aesthetic landing page banners",
        "Customized Shopify theme sections",
      ],
    },
    {
      id: "media-lead",
      title: "Media Team Leadership",
      company: "PT. Hendratama Anugrah Cipta",
      description:
        "Orchestrated content creation from ideation to final deployment.",
      longDescription:
        "Led a dedicated media team to ensure consistent brand voice and high-quality production standards across multiple digital channels.",
      category: "Strategy",
      icon: Briefcase,
      color: "from-orange-500 to-amber-500",
      tasks: [
        "Supervised media team for smooth operations",
        "Delegated creative tasks effectively",
        "Managed content lifecycle from ideation",
        "Ensured collaboration across departments",
      ],
    },
    {
      id: "visual-marketing",
      title: "Marketing Visual Systems",
      company: "PT. Elco Mandiri Indonesia",
      description:
        "Marketplace-focused graphic design and social media growth.",
      longDescription:
        "Enhanced regional brand visibility by creating professional marketing assets for major e-commerce marketplaces and social platforms.",
      category: "Marketing",
      icon: PlayCircle,
      color: "from-blue-500 to-cyan-500",
      tasks: [
        "Produced marketplace product visuals",
        "Researched and created viral social content",
        "Designed banners for shop visibility",
        "Managed accounts for increased engagement",
      ],
    },
  ];

  const groupedSkills = [
    { category: "Creative", items: ["Adobe Photoshop", "Canva"] },
    { category: "Video", items: ["Adobe Premiere Pro", "CapCut"] },
    {
      category: "Artificial Intelligence",
      items: [
        "AI Scripting",
        "VO Generation",
        "Image Generation",
        "Song/BGM Generation",
      ],
    },
    {
      category: "Marketing",
      items: ["META", "Social Media Management", "TikTok Studio"],
    },
    {
      category: "Live Stream Tools",
      items: ["OBS / Tiktok Live Studio", "Tikfinity"],
    },
    {
      category: "E-Commerce",
      items: [
        "Tokopedia",
        "Shopee",
        "Lazada",
        "TikTok Shop",
        "Shopify",
        "Jubelio",
      ],
      description:
        "Proficient in Seller Center dashboards across all major marketplaces, including product management, store aesthetic decoration, and SEO title optimization for maximum visibility.",
    },
  ];

  const experience = [
    {
      company: "PT. Joy Play Culture",
      role: "Graphic Designer MCN",
      period: "Oct 2024 - Jan 2025",
      image: "/joyplay-team.JPG",
      description:
        "End-to-end creative production for TikTok & Instagram ecosystems.",
      details: [
        "Designing daily Instagram post content and TikTok thumbnails.",
        "Shooting and editing short-form video content (Reels/TikTok).",
        "Collaborating on creative client proposals.",
      ],
    },
    {
      company: "PT. Hendratama Anugrah Cipta",
      role: "Shopify Junior Support (Freelance)",
      period: "Apr 2024 - Jul 2024",
      description: "E-commerce optimization and storefront design.",
      details: [
        "Landing page banner design aligned with brand aesthetics.",
        "Theme section customization and content structure.",
        "Product catalog management and SEO optimization.",
      ],
    },
    {
      company: "PT. Hendratama Anugrah Cipta",
      role: "Content Creator | Media Team Lead",
      period: "Oct 2022 - Dec 2023",
      image: "/Hendratama-Team.jpg",
      description:
        "Leadership role managing creative workflows and team operations.",
      details: [
        "Supervised media team operations and cross-department collaboration.",
        "Managed content lifecycle from ideation to final deployment.",
        "Delegated creative tasks to maintain high team output.",
      ],
    },
    {
      company: "PT. Raja Golf Indonesia",
      role: "Audit Staff",
      period: "Jan 2022 - Sep 2022",
      image: "/Raja-Team.jpg",
      description: "Inventory management and data-driven reporting.",
      details: [
        "Performed monthly stocktaking across 10+ locations.",
        "Optimized stock levels and inventory accuracy.",
        "Generated detailed Excel reports for leadership.",
      ],
    },
    {
      company: "PT. Elco Mandiri Indonesia",
      role: "Graphic Designer | Video Editor",
      period: "Sep 2018 - Dec 2021",
      description: "Visual asset creation for marketplaces and social media.",
      details: [
        "Produced marketplace-optimized product visuals.",
        "Designed high-impact shop banners for brand visibility.",
        "Increased organic engagement through strategic social content.",
      ],
    },
    {
      company: "PT. Koolsnap Multiretail Indo",
      role: "Sales Officer",
      period: "Aug 2017 - Jun 2018",
      image: "/Koolsnap-Team.jpg",
      description: "Driving sales through expert product knowledge and technical empowerment.",
      details: [
        "Consulted with buyers to identify needs and provide tailored product solutions.",
        "Built customer trust by effectively addressing complex technical inquiries.",
        "Empowered buyers with basic photography training to support informed decisions.",
        "Maintained operational excellence and a high-standard store environment.",
      ],
    },
  ];

  const education = {
    institution: "Bina Sarana Informatika",
    major: "Information System",
    period: "2018 - 2022",
  };

  const portfolioCategories = [
    {
      id: "content",
      title: "Content Creator",
      description: "Strategic storytelling and digital presence management.",
      icon: Camera,
      color: "from-purple-500/20",
    },
    {
      id: "graphic",
      title: "Graphic Designer",
      description: "Visual identities and commercial assets for brands.",
      icon: Palette,
      color: "from-blue-500/20",
    },
    {
      id: "video",
      title: "Video Editor",
      description: "Dynamic short-form and high-production video content.",
      icon: PlayCircle,
      color: "from-red-500/20",
    },
    {
      id: "ai",
      title: "What can I do with AI",
      description:
        "Leveraging generative tools for efficient workflow automation.",
      icon: Brain,
      color: "from-orange-500/20",
    },
    {
      id: "personal",
      title: "Personal Project",
      description: "Experimental work and creative passion projects.",
      icon: Star,
      color: "from-emerald-500/20",
    },
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0A] selection:bg-orange-500/30 selection:text-orange-200 relative">
      {/* Dynamic Background Decorations */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {/* Animated Orbs */}
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-orange-600/15 blur-[120px] rounded-full"
        />
        <motion.div
          animate={{
            x: [0, -80, 0],
            y: [0, 120, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear",
            delay: 2,
          }}
          className="absolute bottom-[-15%] right-[-10%] w-[60%] h-[60%] bg-amber-600/10 blur-[150px] rounded-full"
        />
        <motion.div
          animate={{
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-orange-400/5 blur-[100px] rounded-full"
        />

        {/* Grid pattern - Enhanced visibility */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#ffffff1a_0.5px,transparent_1px)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_80%_60%_at_50%_0%,#000_80%,transparent_100%)]" />

        {/* Grain texture overlay - Enhanced visibility */}
        <div
          className="absolute inset-0 opacity-[0.08] mix-blend-overlay pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* Image Modal Preview */}
      <AnimatePresence>
        {selectedPreviewImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedPreviewImage(null)}
              className="absolute inset-0 bg-black/90 backdrop-blur-2xl cursor-zoom-out"
            />
            <motion.div
              layoutId={`img-${selectedPreviewImage}`}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative z-10 max-w-full max-h-full group"
            >
              <img
                src={selectedPreviewImage}
                alt="Preview"
                className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
              />
              <button
                onClick={() => setSelectedPreviewImage(null)}
                className="absolute top-[-50px] right-0 flex items-center gap-2 text-white/50 hover:text-white transition-colors"
              >
                <span className="text-xs font-mono uppercase tracking-widest">Close</span>
                <X className="w-6 h-6" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div
        className={`relative z-10 max-w-7xl mx-auto px-6 md:px-12 py-12 md:py-24 ${view === "home" ? "grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-12 lg:gap-24" : "flex flex-col items-center"}`}
      >
        {/* Sidebar for Home, Centered Header for others */}
        {view === "home" ? (
          <motion.aside
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="space-y-8 lg:sticky lg:top-8 h-fit z-30 flex flex-col items-center lg:items-start text-center lg:text-left"
          >
            <div className="space-y-8 flex flex-col items-center lg:items-start">
              <div className="space-y-4 flex flex-col items-center lg:items-start">
                <div className="relative group w-24 h-24 md:w-32 md:h-32">
                  <div className="absolute inset-0 bg-gradient-to-tr from-orange-500 to-amber-300 rounded-2xl rotate-6 group-hover:rotate-12 transition-transform duration-500" />
                  <motion.div
                    whileHover={{
                      scale: 1.25,
                      y: -20,
                      rotate: 0,
                      boxShadow: "0 25px 50px -12px rgba(249, 115, 22, 0.5)",
                    }}
                    onClick={() => setSelectedPreviewImage("/MySelf.jpg")}
                    className="absolute inset-0 bg-zinc-900 rounded-2xl flex items-center justify-center border border-white/10 overflow-hidden shadow-2xl z-20 transition-all duration-300 transform-gpu cursor-zoom-in"
                  >
                    <img
                      src="/MySelf.jpg"
                      alt="Alif Akbar Alwafi"
                      className="w-full h-full object-cover transition-all duration-500 relative z-10"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                    <Camera className="w-10 h-10 text-zinc-700 absolute" />
                  </motion.div>
                </div>
                <div>
                  <h1 className="text-2xl md:text-4xl font-display font-bold tracking-tight text-white leading-tight">
                    Alif Akbar Alwafi
                  </h1>
                  <p className="text-orange-500 font-mono text-[10px] md:text-sm tracking-widest mt-1 uppercase">
                    Creative Professional
                  </p>
                </div>
              </div>

              {/* About Section - Moved to Sidebar */}
              <div className="space-y-4 border-t border-white/5 pt-8">
                <h2 className="text-[10px] font-mono uppercase tracking-[0.2em] text-orange-500">
                  About Me
                </h2>
                <div className="space-y-3">
                  <p className="text-base md:text-lg leading-relaxed text-zinc-300 font-light italic">
                    "I bring over{" "}
                    <span className="text-white font-medium">
                      4 years of experience
                    </span>{" "}
                    across retail and creative industries, leveraging a diverse
                    toolkit for impactful digital storytelling."
                  </p>
                  <p className="text-zinc-400 text-xs leading-relaxed">
                    Driven by a desire to continuously adapt and learn, I thrive
                    in dynamic environments where content creation, photo/video
                    editing, and marketplace strategy converge.
                  </p>
                </div>
              </div>

              <div className="pt-2 flex">
                <button
                  onClick={() => setIsContactOpen(true)}
                  className="w-full md:w-auto px-6 py-3 bg-white text-black font-bold rounded-full hover:bg-orange-500 hover:text-white transition-all transform hover:scale-105 active:scale-95 text-xs shadow-xl shadow-white/5 hover:shadow-orange-500/20"
                >
                  Contact me
                </button>
              </div>
            </div>
          </motion.aside>
        ) : (
          <motion.header
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-center mb-24 space-y-8"
          >
            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl font-display font-bold tracking-tighter text-white">
                Alif Akbar Alwafi
              </h1>
              <p className="text-orange-500 font-mono text-sm md:text-base tracking-[0.3em] uppercase">
                Creative Professional
              </p>
            </div>
            <div className="pt-4">
              <button
                onClick={() => setIsContactOpen(true)}
                className="px-8 py-4 bg-white text-black font-bold rounded-full hover:bg-orange-500 hover:text-white transition-all transform hover:scale-105 active:scale-95 text-sm"
              >
                Contact me
              </button>
            </div>
          </motion.header>
        )}

        {/* Main Content */}
        <AnimatePresence mode="wait">
          {view === "home" ? (
            <motion.main
              key="home-view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
              className="space-y-24"
            >
              <section className="space-y-8">
                <motion.div variants={itemVariants}>
                  <h2 className="text-sm font-mono uppercase tracking-widest text-orange-500 mb-8 flex items-center gap-4">
                    <span>Core Hard Skills</span>
                    <span className="h-px flex-1 bg-white/5"></span>
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {groupedSkills.map((group) => (
                      <div
                        key={group.category}
                        className="p-5 rounded-xl bg-zinc-900/40 border border-white/5 hover:border-orange-500/30 hover:bg-zinc-800/40 transition-all duration-300 group flex flex-col gap-2 relative overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-orange-500/70">
                          {group.category}
                        </span>
                        <div className="flex flex-wrap gap-2 items-center">
                          {group.items.map((item, i) => (
                            <div key={item} className="flex items-center">
                              <span className="text-zinc-100 font-medium text-sm md:text-base leading-none group-hover:text-white transition-colors">
                                {item}
                              </span>
                              {i < group.items.length - 1 && (
                                <span className="ml-2 text-zinc-700 font-light select-none">
                                  /
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                        {"description" in group && (
                          <p className="text-[11px] text-zinc-500 leading-relaxed font-light mt-1 border-t border-white/5 pt-2 group-hover:text-zinc-400 transition-colors">
                            {group.description as string}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </motion.div>
              </section>

              {/* Selected Works - Stashed for later */}
              {/* <section id="projects" className="space-y-8"> ... </section> */}

              {/* Quick Experience Preview */}
              <section className="space-y-8">
                <motion.div variants={itemVariants}>
                  <h2 className="text-sm font-mono uppercase tracking-widest text-orange-500 mb-8 flex items-center gap-4">
                    <span>Recent Experience</span>
                    <span className="h-px flex-1 bg-white/5"></span>
                  </h2>
                  <div className="space-y-12">
                    {experience.slice(0, 3).map((exp, idx) => (
                      <div
                        key={idx}
                        className="group relative pl-8 border-l border-white/5 hover:border-orange-500/50 transition-all duration-300"
                      >
                        <div className="absolute left-[-5px] top-2 w-2 h-2 rounded-full border border-zinc-700 bg-zinc-900 group-hover:bg-orange-500 group-hover:border-orange-400 transition-all duration-500 group-hover:scale-125 z-10" />
                        <div className="absolute left-[-15px] top-[-8px] w-8 h-8 rounded-full bg-orange-500/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="space-y-3">
                          <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-2">
                            <div>
                              <h3 className="text-lg font-bold text-white group-hover:text-orange-500 transition-colors">
                                {exp.role}
                              </h3>
                              <p className="text-zinc-400 font-medium">
                                {exp.company}
                              </p>
                            </div>
                            <span className="text-xs font-mono text-zinc-600 group-hover:text-zinc-400 transition-colors">
                              {exp.period}
                            </span>
                          </div>
                          <p className="text-zinc-500 text-sm leading-relaxed max-w-xl italic group-hover:text-zinc-400 transition-colors">
                            {exp.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button
                      onClick={() => {
                        window.scrollTo({ top: 0, behavior: "smooth" });
                        setView("career");
                      }}
                      className="flex items-center justify-center gap-2 text-sm font-medium text-white hover:text-orange-500 transition-colors group px-6 py-4 rounded-full border border-white/10 hover:border-orange-500/50 bg-white/5"
                    >
                      See full career journey
                      <ExternalLink className="w-3 h-3 transition-transform group-hover:translate-x-1" />
                    </button>
                    <button
                      onClick={() => {
                        window.scrollTo({ top: 0, behavior: "smooth" });
                        setView("portfolio-hub");
                      }}
                      className="flex items-center justify-center gap-2 text-sm font-bold text-black bg-orange-500 px-6 py-4 rounded-full hover:bg-orange-400 transition-all transform hover:scale-[1.02] shadow-xl shadow-orange-500/10"
                    >
                      Dive Deeper About Me
                      <ChevronLeft className="w-4 h-4 rotate-180" />
                    </button>
                  </div>
                </motion.div>
              </section>

              {/* Footer Quote / CTA */}
              <section className="pt-24 border-t border-white/5">
                <motion.div
                  variants={itemVariants}
                  className="text-center md:text-left group/quote"
                >
                  <motion.h3
                    animate={{
                      textShadow: [
                        "0 0 0px rgba(249, 115, 22, 0)",
                        "0 0 0px rgba(249, 115, 22, 0)",
                        "0 0 40px rgba(249, 115, 22, 0.8), 0 0 80px rgba(249, 115, 22, 0.4)",
                        "0 0 40px rgba(249, 115, 22, 0.8), 0 0 80px rgba(249, 115, 22, 0.4)",
                        "0 0 0px rgba(249, 115, 22, 0)",
                        "0 0 0px rgba(249, 115, 22, 0)",
                      ],
                      color: ["#27272a", "#ffffff", "#ffffff", "#ffffff", "#ffffff", "#27272a"],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut",
                      times: [0, 0.2, 0.4, 0.6, 0.8, 1],
                    }}
                    className="text-4xl md:text-6xl font-display font-bold text-zinc-800 cursor-default leading-tight"
                  >
                    ADAPT. LEARN. <br />
                    CREATE. IMPACT.
                  </motion.h3>
                </motion.div>
              </section>
            </motion.main>
          ) : view === "career" ? (
            <motion.main
              key="career-view"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="w-full max-w-4xl"
            >
              <div className="mb-12">
                <button
                  onClick={() => setView("home")}
                  className="group inline-flex items-center gap-2 text-sm font-mono text-zinc-500 hover:text-white transition-colors"
                >
                  <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                  Back to Overview
                </button>
              </div>

              <section className="space-y-12">
                <div className="space-y-4 border-b border-white/5 pb-10">
                  <h2 className="text-xs font-mono uppercase tracking-widest text-orange-500">
                    Career History
                  </h2>
                  <h1 className="text-5xl md:text-7xl font-display font-bold text-white tracking-tighter">
                    Experience Journey
                  </h1>
                </div>

                <div className="space-y-32">
                  {experience.map((exp, idx) => (
                    <div key={idx} className="space-y-8">
                      <div className="flex flex-col md:flex-row md:items-end justify-between pl-8 gap-4">
                        <div className="space-y-2">
                          <p className="text-xs font-mono text-zinc-600 uppercase tracking-widest">
                            {exp.period}
                          </p>
                          <h3 className="text-3xl md:text-4xl font-bold text-white">
                            {exp.company}
                          </h3>
                          <p className="text-orange-500 font-mono text-lg tracking-wide">
                            {exp.role}
                          </p>
                        </div>
                      </div>
                      <div className="pl-8 space-y-8">
                        {exp.image && (
                          <div 
                            className="relative group max-w-2xl cursor-zoom-in"
                            onClick={() => setSelectedPreviewImage(exp.image as string)}
                          >
                            <div className="absolute inset-0 bg-orange-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl" />
                            <img
                              src={exp.image}
                              alt={exp.company}
                              className="relative z-10 w-full rounded-2xl border border-white/10 shadow-2xl transition-transform duration-500 group-hover:scale-[1.01]"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                        )}
                        <p className="text-zinc-300 text-xl leading-relaxed italic font-light max-w-3xl">
                          {exp.description}
                        </p>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                          {exp.details.map((detail, i) => (
                            <li
                              key={i}
                              className="flex gap-4 text-zinc-400 text-sm md:text-base group"
                            >
                              <span className="text-orange-500/40 group-hover:text-orange-500 font-mono flex-shrink-0 transition-colors">
                                —
                              </span>
                              <span className="leading-relaxed">{detail}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="mt-48 pt-24 border-t border-white/5 space-y-12 mb-24">
                <h2 className="text-sm font-mono uppercase tracking-widest text-orange-500">
                  Education Background
                </h2>
                <div className="p-8 md:p-12 rounded-[30px] md:rounded-[40px] bg-zinc-900/30 border border-white/5 flex flex-col md:flex-row justify-between items-center gap-8 group hover:bg-zinc-900/50 transition-all">
                  <div className="text-center md:text-left space-y-2 md:space-y-4">
                    <h3 className="text-2xl md:text-4xl font-bold text-white">
                      {education.institution}
                    </h3>
                    <p className="text-lg md:text-xl text-zinc-400 font-light italic">
                      {education.major}
                    </p>
                  </div>
                  <div className="text-center md:text-right">
                    <span className="px-6 md:px-8 py-2 md:py-3 rounded-full border border-orange-500/20 bg-orange-500/5 text-orange-500 font-mono text-[10px] md:text-sm tracking-widest whitespace-nowrap">
                      CLASS OF {education.period}
                    </span>
                  </div>
                </div>
              </section>

              <footer className="py-24 text-center">
                <button
                  onClick={() => {
                    window.scrollTo({ top: 0, behavior: "smooth" });
                    setView("home");
                  }}
                  className="text-zinc-700 hover:text-white font-mono text-xs uppercase tracking-[0.4em] transition-colors"
                >
                  Return Home
                </button>
              </footer>
              <motion.div 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                className="mt-24 pt-12 border-t border-white/5 flex flex-col items-center gap-6"
              >
                <p className="text-zinc-500 text-sm font-mono uppercase tracking-[0.3em]">End of Career Journey</p>
                <button
                  onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                  className="flex items-center gap-2 px-8 py-3 rounded-full bg-zinc-900 border border-white/10 text-white hover:bg-orange-500 hover:border-orange-500 transition-all group shadow-xl"
                >
                  <ChevronLeft className="w-4 h-4 rotate-90 group-hover:-translate-y-1 transition-transform" />
                  Back to Top
                </button>
              </motion.div>
            </motion.main>
          ) : view === "portfolio-hub" ? (
            <motion.main
              key="hub-view"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-5xl"
            >
              <div className="mb-12">
                <button
                  onClick={() => setView("home")}
                  className="group inline-flex items-center gap-2 text-sm font-mono text-zinc-500 hover:text-white transition-colors"
                >
                  <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                  Back to Overview
                </button>
              </div>

              <div className="space-y-6 mb-20 text-center max-w-3xl mx-auto">
                <h2 className="text-sm font-mono uppercase tracking-widest text-orange-500">
                  Deep Dive
                </h2>
                <h1 className="text-4xl md:text-6xl font-display font-bold text-white tracking-tighter">
                  My Creative Portfolios
                </h1>
                <p className="text-xl text-zinc-400 leading-relaxed font-light italic">
                  Explore my work across various specializations. Each path
                  represents a core facet of my professional journey and
                  technical expertise.
                </p>
              </div>

              <div className="flex flex-wrap justify-center gap-6">
                {portfolioCategories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setSelectedCategory(cat.id);
                      setView("portfolio-detail");
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="w-full md:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] p-8 pb-10 rounded-[2rem] bg-zinc-900/50 border border-white/5 hover:border-orange-500/40 hover:bg-zinc-800/50 transition-all text-left flex flex-col gap-8 group relative overflow-hidden"
                  >
                    <div
                      className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${cat.color} blur-3xl opacity-0 group-hover:opacity-100 transition-opacity`}
                    />
                    <div className="w-14 h-14 rounded-2xl bg-zinc-800 border border-white/10 flex items-center justify-center text-orange-500 group-hover:scale-110 transition-transform group-hover:bg-orange-500 group-hover:text-black">
                      <cat.icon className="w-7 h-7" />
                    </div>
                    <div className="space-y-3 relative z-10">
                      <h3 className="text-2xl font-bold text-white group-hover:text-orange-500 transition-colors uppercase">
                        {cat.title}
                      </h3>
                      <p className="text-sm text-zinc-500 leading-relaxed font-medium">
                        {cat.description}
                      </p>
                    </div>
                    <div className="mt-auto flex items-center gap-2 text-xs font-mono text-zinc-600 group-hover:text-white transition-colors">
                      VIEW PROJECTS{" "}
                      <ChevronLeft className="w-3 h-3 rotate-180" />
                    </div>
                  </button>
                ))}
              </div>

              <motion.div 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                className="mt-24 pt-12 border-t border-white/5 flex flex-col items-center gap-6"
              >
                <p className="text-zinc-500 text-sm font-mono uppercase tracking-[0.3em]">End of Portfolio</p>
                <button
                  onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                  className="flex items-center gap-2 px-8 py-3 rounded-full bg-zinc-900 border border-white/10 text-white hover:bg-orange-500 hover:border-orange-500 transition-all group shadow-xl"
                >
                  <ChevronLeft className="w-4 h-4 rotate-90 group-hover:-translate-y-1 transition-transform" />
                  Back to Top
                </button>
              </motion.div>
            </motion.main>
          ) : (
            view === "portfolio-detail" && (
              <motion.main
                key="detail-view"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="w-full max-w-4xl"
              >
                <div className="mb-12">
                  <button
                    onClick={() => setView("portfolio-hub")}
                    className="group inline-flex items-center gap-2 text-sm font-mono text-zinc-500 hover:text-white transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Back to Selection
                  </button>
                </div>

                <div className="space-y-12">
                  <div className="space-y-6">
                    <h2 className="text-sm font-mono uppercase tracking-widest text-orange-500">
                      {
                        portfolioCategories.find(
                          (c) => c.id === selectedCategory,
                        )?.title
                      }
                    </h2>
                    <h1 className="text-4xl md:text-7xl font-display font-bold text-white tracking-tighter">
                      Short Brief
                    </h1>
                    <p className="text-lg md:text-xl text-zinc-400 max-w-2xl font-light italic leading-relaxed">
                      {selectedCategory === "content"
                        ? "I leverage my expertise in content creation to develop captivating soft and hard-selling content. This includes conducting thorough research, establishing optimized publishing schedules, and meticulously managing content delivery to meet established deadlines."
                        : selectedCategory === "ai"
                          ? "Exploring the frontier of generative AI to build more efficient, creative, and impactful digital solutions."
                          : "A collection of professional projects and collaborative successes in this field."}
                    </p>
                  </div>

                  {/* Content Creator Detail View */}
                  {selectedCategory === "content" ? (
                    <div className="space-y-24 pt-12 border-t border-white/5">
                      <section className="space-y-12">
                        <div className="p-8 md:p-12 rounded-[2.5rem] bg-zinc-900/30 border border-white/5 relative overflow-hidden group">
                          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 blur-3xl rounded-full" />
                          <div className="relative z-10 space-y-6">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-500 text-[10px] font-mono tracking-widest uppercase">
                              Professional Workflow
                            </div>
                            <h3 className="text-3xl font-display font-medium text-white">
                              Mapping the Progress
                            </h3>
                            <p className="text-zinc-400 leading-relaxed max-w-2xl font-light">
                              My process is built on consistency and data-driven
                              insights. From the initial spark of an idea to
                              long-term audience management, every step is
                              optimized for impact.
                            </p>

                            {/* Interactive Diagram */}
                            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-12 relative">
                              {[
                                {
                                  step: "01",
                                  title: "Audience Research",
                                  desc: "Identifying target personas and market trends.",
                                },
                                {
                                  step: "02",
                                  title: "Developing Ideas",
                                  desc: "Creative brainstorming and viral concept mapping.",
                                },
                                {
                                  step: "03",
                                  title: "Produce Content",
                                  desc: "High-fidelity production and technical execution.",
                                },
                                {
                                  step: "04",
                                  title: "Scheduling",
                                  desc: "Optimized deployment for peak engagement.",
                                },
                                {
                                  step: "05",
                                  title: "Management",
                                  desc: "Social media ecosystem and growth monitoring.",
                                },
                              ].map((item, i) => (
                                <motion.div
                                  key={i}
                                  initial={{ opacity: 0, y: 20 }}
                                  whileInView={{ opacity: 1, y: 0 }}
                                  viewport={{ once: true }}
                                  transition={{ delay: i * 0.1 }}
                                  className="relative group/step"
                                >
                                  <div className="p-6 rounded-2xl bg-zinc-800/50 border border-white/5 group-hover/step:border-orange-500/30 transition-all h-full flex flex-col gap-4">
                                    <span className="text-2xl font-display font-bold text-orange-500/20 group-hover/step:text-orange-500/50 transition-colors">
                                      {item.step}
                                    </span>
                                    <div className="space-y-2">
                                      <h4 className="text-sm font-bold text-white group-hover/step:text-orange-500 transition-colors">
                                        {item.title}
                                      </h4>
                                      <p className="text-[11px] text-zinc-500 leading-tight group-hover/step:text-zinc-400 transition-colors">
                                        {item.desc}
                                      </p>
                                    </div>
                                  </div>
                                  {i < 4 && (
                                    <div className="hidden md:block absolute top-1/2 -right-2 w-4 h-px bg-white/10 z-0" />
                                  )}
                                </motion.div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </section>

                      <section className="space-y-12">
                        <div className="p-8 md:p-12 rounded-[2.5rem] bg-zinc-900/10 border border-white/5 relative overflow-hidden group">
                          <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-500/5 blur-3xl rounded-full" />
                          <div className="relative z-10 space-y-6">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-500 text-[10px] font-mono tracking-widest uppercase">
                              Creative Strategy
                            </div>
                            <h3 className="text-3xl font-display font-medium text-white">
                              Mapping The Ideas
                            </h3>
                            <p className="text-zinc-400 leading-relaxed max-w-2xl font-light">
                              Innovation doesn't happen in a vacuum. My ideation
                              process is a spiderweb of connections, linking raw
                              data to creative execution.
                            </p>

                            {/* Desktop Mind Map */}
                            <div className="hidden md:flex relative h-[600px] mt-16 items-center justify-center scale-90 md:scale-100 transform-gpu transition-transform">
                              {/* SVG Layer for Connectors */}
                              <svg className="absolute inset-0 w-full h-full z-10 pointer-events-none">
                                {[
                                  { x: -160, y: -140 },
                                  { x: 160, y: -140 },
                                  { x: 200, y: 100 },
                                  { x: -200, y: 100 },
                                  { x: 0, y: 180 },
                                ].map((pos, i) => (
                                  <motion.line
                                    key={`line-${i}`}
                                    x1="50%"
                                    y1="50%"
                                    x2={`calc(50% + ${pos.x}px)`}
                                    y2={`calc(50% + ${pos.y}px)`}
                                    stroke="rgba(249, 115, 22, 0.25)"
                                    strokeWidth="1.5"
                                    strokeDasharray="4 6"
                                    initial={{ pathLength: 0, opacity: 0 }}
                                    whileInView={{ pathLength: 1, opacity: 1 }}
                                    viewport={{ once: true }}
                                    transition={{
                                      duration: 1.5,
                                      delay: 0.5 + i * 0.15,
                                      ease: "easeOut",
                                    }}
                                  />
                                ))}
                              </svg>

                              {/* Animated Center Node */}
                              <motion.div
                                animate={{ scale: [1, 1.05, 1] }}
                                transition={{
                                  duration: 4,
                                  repeat: Infinity,
                                  ease: "easeInOut",
                                }}
                                className="z-30 w-32 h-32 md:w-44 md:h-44 rounded-full bg-zinc-950 border-2 border-orange-500/40 flex flex-col items-center justify-center text-center p-4 shadow-[0_0_60px_rgba(249,115,22,0.2)] relative"
                              >
                                <div className="absolute inset-0 bg-orange-500/5 rounded-full animate-pulse" />
                                <Brain className="w-10 h-10 text-orange-500 mb-2 relative z-10" />
                                <span className="text-[10px] md:text-xs font-mono font-bold text-white uppercase tracking-tighter relative z-10">
                                  IDEATION
                                  <br />
                                  ENGINE
                                </span>
                              </motion.div>

                              {/* Nodes */}
                              {[
                                {
                                  title: "Audience Pain Points",
                                  icon: Mail,
                                  color: "text-red-400",
                                  x: -160,
                                  y: -140,
                                  label: "DMs & Comments",
                                },
                                {
                                  title: "Technical Data",
                                  icon: Globe,
                                  color: "text-blue-400",
                                  x: 160,
                                  y: -140,
                                  label: "Keyword Trends",
                                },
                                {
                                  title: "Competitor Analysis",
                                  icon: Star,
                                  color: "text-amber-400",
                                  x: 200,
                                  y: 100,
                                  label: "Viral Hooks",
                                },
                                {
                                  title: "Personal Insight",
                                  icon: BookOpen,
                                  color: "text-green-400",
                                  x: -200,
                                  y: 100,
                                  label: "Unique Story",
                                },
                                {
                                  title: "Meta Trends",
                                  icon: Layers,
                                  color: "text-purple-400",
                                  x: 0,
                                  y: 180,
                                  label: "Social Heatmap",
                                },
                              ].map((node, i) => (
                                <motion.div
                                  key={`node-${i}`}
                                  initial={{ opacity: 0, scale: 0 }}
                                  whileInView={{ opacity: 1, scale: 1 }}
                                  whileHover={{ scale: 1.1, y: node.y - 10 }}
                                  viewport={{ once: true }}
                                  transition={{
                                    type: "spring",
                                    stiffness: 260,
                                    damping: 20,
                                    delay: 1 + i * 0.15,
                                  }}
                                  style={{
                                    position: "absolute",
                                    left: "50%",
                                    top: "50%",
                                    x: node.x,
                                    y: node.y,
                                    translateX: "-50%",
                                    translateY: "-50%",
                                    pointerEvents: "auto",
                                  }}
                                  className="z-40 group/node cursor-default"
                                >
                                  <div className="flex flex-col items-center gap-3">
                                    <div className="w-14 h-14 rounded-2xl bg-zinc-950 border border-white/10 flex items-center justify-center group-hover/node:border-orange-500/60 transition-all shadow-2xl relative overflow-hidden">
                                      <div className="absolute inset-0 bg-orange-500/5 opacity-0 group-hover/node:opacity-100 transition-opacity" />
                                      <node.icon
                                        className={`w-6 h-6 ${node.color} relative z-10`}
                                      />
                                    </div>
                                    <div className="text-center px-4 py-2 rounded-xl bg-zinc-900/80 backdrop-blur-md border border-white/5 shadow-xl">
                                      <h4 className="text-[10px] font-bold text-white uppercase tracking-tighter whitespace-nowrap">
                                        {node.title}
                                      </h4>
                                      <p className="text-[8px] text-zinc-500 font-mono group-hover/node:text-orange-400 transition-colors uppercase mt-1">
                                        {node.label}
                                      </p>
                                    </div>
                                  </div>
                                </motion.div>
                              ))}
                            </div>

                            {/* Mobile Mind Map - New Optimized Version */}
                            <div className="md:hidden space-y-4 mt-8">
                                <div className="flex flex-col items-center gap-2 mb-8">
                                    <div className="w-16 h-16 rounded-full bg-orange-500/20 flex items-center justify-center border border-orange-500/30">
                                        <Brain className="w-8 h-8 text-orange-500" />
                                    </div>
                                    <h4 className="text-white font-display font-bold text-xl uppercase tracking-widest text-center">
                                        Ideation Engine
                                    </h4>
                                    <div className="w-8 h-1 bg-orange-500/50 rounded-full" />
                                </div>
                                <div className="grid grid-cols-1 gap-3">
                                    {[
                                        { title: "Audience Pain Points", sub: "DMs & Audience Comments", icon: Mail, color: "text-red-400", bg: "bg-red-400/10" },
                                        { title: "Technical Data", sub: "Global Keyword Trends", icon: Globe, color: "text-blue-400", bg: "bg-blue-400/10" },
                                        { title: "Competitor Analysis", sub: "Viral Hook Psychology", icon: Star, color: "text-amber-400", bg: "bg-amber-400/10" },
                                        { title: "Personal Insight", sub: "Connecting with Unique Stories", icon: BookOpen, color: "text-green-400", bg: "bg-green-400/10" },
                                        { title: "Meta Trends", sub: "Social Content Heatmaps", icon: Layers, color: "text-purple-400", bg: "bg-purple-400/10" }
                                    ].map((node, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, x: -20 }}
                                            whileInView={{ opacity: 1, x: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ delay: i * 0.1 }}
                                            className="flex items-center gap-4 p-4 rounded-2xl bg-zinc-900 border border-white/5"
                                        >
                                            <div className={`p-3 rounded-xl ${node.bg} ${node.color} flex-shrink-0`}>
                                                <node.icon className="w-5 h-5" />
                                            </div>
                                            <div className="text-left">
                                                <div className="text-xs font-bold text-white uppercase tracking-wider">{node.title}</div>
                                                <div className="text-[10px] text-zinc-500 font-light">{node.sub}</div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                          </div>
                        </div>
                      </section>

                      <section className="space-y-12 pb-12">
                        <div className="flex flex-col gap-8">
                          <div className="space-y-2">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 text-[10px] font-mono tracking-widest uppercase">
                              Case Study
                            </div>
                            <h3 className="text-3xl font-display font-medium text-white">
                              Hard Selling Content Preview
                            </h3>
                            <p className="text-zinc-400 leading-relaxed max-w-3xl font-light">
                              A comprehensive simulation of a Hard Selling campaign
                              for "Cozyon"—spanning from strategic audience psychology
                              mapping to the final production-ready video.
                            </p>
                          </div>

                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Narrative & Video Preview */}
                            <div className="space-y-8 order-2 lg:order-1">
                              <div className="p-8 rounded-[2.5rem] bg-zinc-900/30 border border-white/5 space-y-6">
                                <div className="flex items-center gap-3">
                                  <div className="p-2 rounded-lg bg-orange-500/10 text-orange-500">
                                    <MessageSquare className="w-5 h-5" />
                                  </div>
                                  <h4 className="text-lg font-bold text-white uppercase tracking-tighter">
                                    Narrative Analysis
                                  </h4>
                                </div>
                                <div className="space-y-4">
                                  <div className="p-4 rounded-xl bg-black/20">
                                    <p className="text-[11px] text-zinc-400 leading-relaxed italic">
                                      "Jadwal padat itu wajar, tapi kaki
                                      tersiksa? Enggak. Pilihan aku hari ini
                                      cuma satu: Cozyon. Empuknya kerasa dari
                                      langkah pertama. Ringan dan nyaman dipakai
                                      seharian. Mau cari kopi, meeting santai,
                                      sampai jalan sore, tetap masuk. Yuk, level
                                      up kenyamanan kamu!"
                                    </p>
                                  </div>
                                  <div className="grid grid-cols-1 gap-4">
                                    <div className="space-y-1">
                                      <p className="text-[10px] font-mono text-orange-500 uppercase">
                                        Strategy
                                      </p>
                                      <p className="text-[11px] text-zinc-300 font-medium leading-relaxed italic pl-3">
                                        Menghubungkan kesibukan atau jadwal yang
                                        padat dengan rasa tidak nyaman pada kaki
                                        (kaki tersiksa).
                                      </p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                      <div className="space-y-1">
                                        <p className="text-[10px] font-mono text-orange-500 uppercase">
                                          Hook Strategy
                                        </p>
                                        <p className="text-[10px] text-zinc-500">
                                          Visual pegal & transisi cepat
                                        </p>
                                      </div>
                                      <div className="space-y-1">
                                        <p className="text-[10px] font-mono text-orange-500 uppercase">
                                          Tone of Voice
                                        </p>
                                        <p className="text-[10px] text-zinc-500">
                                          Empati, Solutif, Eksklusif
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className="relative group overflow-hidden rounded-[2.5rem] bg-black border border-white/10 aspect-[9/16] max-w-[320px] mx-auto">
                                <video
                                  ref={videoRef}
                                  className="w-full h-full object-cover"
                                  controls={isVideoPlaying}
                                  playsInline
                                  preload="metadata"
                                  onPlay={() => setIsVideoPlaying(true)}
                                  onPause={() => setIsVideoPlaying(false)}
                                  onEnded={() => setIsVideoPlaying(false)}
                                >
                                  <source
                                    src="/cozyon.mp4#t=0.1"
                                    type="video/mp4"
                                  />
                                </video>
                                {!isVideoPlaying && (
                                  <div
                                    className="absolute inset-0 z-20 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors cursor-pointer"
                                    onClick={handlePlayVideo}
                                  >
                                    <motion.div
                                      whileHover={{ scale: 1.1 }}
                                      whileTap={{ scale: 0.9 }}
                                      className="w-20 h-20 rounded-full bg-orange-500 text-black flex items-center justify-center shadow-[0_0_40px_rgba(249,115,22,0.6)]"
                                    >
                                      <Play className="w-8 h-8 fill-current translate-x-1" />
                                    </motion.div>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Content Structure Mind Map */}
                            <div className="p-8 rounded-[2.5rem] bg-zinc-900/30 border border-white/5 space-y-10 flex flex-col justify-start order-1 lg:order-2">
                              <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 rounded-lg bg-orange-500/10 text-orange-500">
                                  <Brain className="w-5 h-5" />
                                </div>
                                <h4 className="text-lg font-bold text-white uppercase tracking-tighter">
                                  Content Structure Map
                                </h4>
                              </div>

                              <div className="relative space-y-6">
                                {[
                                  {
                                    text: "Pernyataan Masalah",
                                    sub: "Kaki pegal karena jadwal padat",
                                    icon: Footprints,
                                    color: "bg-red-500/20 text-red-500",
                                  },
                                  {
                                    text: "Solusi: Produk Cozyon",
                                    sub: "Jawaban untuk kenyamanan total",
                                    icon: ShoppingBag,
                                    color: "bg-orange-500/20 text-orange-500",
                                  },
                                  {
                                    text: "Penjelasan Fitur",
                                    sub: "Bahan Empuk & Desain Ringan",
                                    icon: Zap,
                                    color: "bg-yellow-500/20 text-yellow-500",
                                  },
                                  {
                                    text: "Skenario Penggunaan",
                                    sub: "Ngopi, meeting, atau jalan sore—outfit tetap stand out di tiap situasi.",
                                    icon: Coffee,
                                    color: "bg-green-500/20 text-green-500",
                                  },
                                  {
                                    text: "Penutup (CTA)",
                                    sub: "Yuk level up kenyamanan kamu!",
                                    icon: MessageSquare,
                                    color: "bg-blue-500/20 text-blue-500",
                                  },
                                ].map((step, idx, arr) => (
                                  <div key={idx} className="relative">
                                    <motion.div
                                      initial={{ opacity: 0, x: 20 }}
                                      whileInView={{ opacity: 1, x: 0 }}
                                      viewport={{ once: true }}
                                      transition={{ delay: idx * 0.1 }}
                                      className="flex items-center gap-4 p-5 rounded-2xl bg-black/40 border border-white/5 hover:border-white/10 transition-colors group"
                                    >
                                      <div
                                        className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${step.color}`}
                                      >
                                        <step.icon className="w-6 h-6" />
                                      </div>
                                      <div>
                                        <p className="text-sm font-bold text-white uppercase tracking-tight">
                                          {step.text}
                                        </p>
                                        <p className="text-[11px] text-zinc-500 font-mono italic group-hover:text-zinc-400 transition-colors">
                                          {step.sub}
                                        </p>
                                      </div>
                                      <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Check className="w-4 h-4 text-orange-500" />
                                      </div>
                                    </motion.div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </section>

                      <section className="space-y-12 pb-12">
                        <div className="flex flex-col gap-8">
                          <div className="space-y-2">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-mono tracking-widest uppercase">
                              Case Study
                            </div>
                            <h3 className="text-3xl font-display font-medium text-white">
                              Soft Selling Content Preview
                            </h3>
                            <p className="text-zinc-400 leading-relaxed max-w-3xl font-light">
                              An implementation of educational Soft Selling content
                              designed to establish "Semarak Media" brand authority,
                              leveraging unique factual hooks and professional
                              expertise demonstrations.
                            </p>
                          </div>

                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Narrative & Video Preview */}
                            <div className="space-y-8 order-2 lg:order-1">
                              <div className="p-8 rounded-[2.5rem] bg-zinc-900/30 border border-white/5 space-y-6">
                                <div className="flex items-center gap-3">
                                  <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
                                    <MessageSquare className="w-5 h-5" />
                                  </div>
                                  <h4 className="text-lg font-bold text-white uppercase tracking-tighter">
                                    Narrative Analysis
                                  </h4>
                                </div>
                                <div className="space-y-4">
                                  <div className="p-4 rounded-xl bg-black/20">
                                    <p className="text-[11px] text-zinc-400 leading-relaxed italic">
                                      "9 dari 10 orang nggak tahu kalau 5
                                      transisi ini bikin videonya lebih boom dan
                                      mind blowing. Whip pan, gerak cepat ke
                                      kanan atau ke kiri lalu sambung klip
                                      berikutnya dengan arah yang sama. Morph
                                      transition, bikin dua klip kelihatan nyatu
                                      kayak kamera nggak pernah berhenti
                                      ngerekam. The cutout, potong objek frame
                                      pertama dan pakai untuk klip berikutnya.
                                      Block cut, gunakan satu frame untuk
                                      nutupin kamera dan lanjut ke scene
                                      berikutnya. Hard cut, potong kasar klip
                                      sebelumnya dengan klip berikutnya. Itu dia
                                      5 tips transisi dari aku. Kalau kamu
                                      pengen tips dan trik menarik lainnya
                                      follow Semarak Media sekarang juga."
                                    </p>
                                  </div>
                                  <div className="grid grid-cols-1 gap-4">
                                    <div className="space-y-1">
                                      <p className="text-[10px] font-mono text-emerald-500 uppercase">
                                        Strategy
                                      </p>
                                      <p className="text-[11px] text-zinc-300 font-medium leading-relaxed italic pl-3">
                                        Menggunakan statistik '9 dari 10 orang'
                                        untuk memancing rasa penasaran audiens
                                        tentang teknik editing video yang belum
                                        banyak diketahui.
                                      </p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                      <div className="space-y-1">
                                        <p className="text-[10px] font-mono text-emerald-500 uppercase">
                                          Hook Strategy
                                        </p>
                                        <p className="text-[10px] text-zinc-500">
                                          Curiosity Gap & Social Proof
                                        </p>
                                      </div>
                                      <div className="space-y-1">
                                        <p className="text-[10px] font-mono text-emerald-500 uppercase">
                                          Tone of Voice
                                        </p>
                                        <p className="text-[10px] text-zinc-500">
                                          Expert, Helpful, Dynamic
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className="relative group overflow-hidden rounded-[2.5rem] bg-black border border-white/10 aspect-[9/16] max-w-[320px] mx-auto">
                                <video
                                  ref={videoRef2}
                                  className="w-full h-full object-cover"
                                  controls={isVideoPlaying2}
                                  playsInline
                                  preload="metadata"
                                  onPlay={() => setIsVideoPlaying2(true)}
                                  onPause={() => setIsVideoPlaying2(false)}
                                  onEnded={() => setIsVideoPlaying2(false)}
                                >
                                  <source
                                    src="/5-transisi-semarak.mp4#t=0.1"
                                    type="video/mp4"
                                  />
                                </video>
                                {!isVideoPlaying2 && (
                                  <div
                                    className="absolute inset-0 z-20 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors cursor-pointer"
                                    onClick={handlePlayVideo2}
                                  >
                                    <motion.div
                                      whileHover={{ scale: 1.1 }}
                                      whileTap={{ scale: 0.9 }}
                                      className="w-20 h-20 rounded-full bg-emerald-500 text-black flex items-center justify-center shadow-[0_0_40px_rgba(16,185,129,0.6)]"
                                    >
                                      <Play className="w-8 h-8 fill-current translate-x-1" />
                                    </motion.div>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Content Structure Mind Map */}
                            <div className="p-8 rounded-[2.5rem] bg-zinc-900/30 border border-white/5 space-y-10 flex flex-col justify-start order-1 lg:order-2">
                              <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
                                  <Brain className="w-5 h-5" />
                                </div>
                                <h4 className="text-lg font-bold text-white uppercase tracking-tighter">
                                  Content Structure Map
                                </h4>
                              </div>

                              <div className="relative space-y-6">
                                {[
                                  {
                                    text: "Hook",
                                    sub: "Berbasis fakta unik (9 dari 10 orang...)",
                                    icon: Zap,
                                    color: "bg-emerald-500/20 text-emerald-500",
                                  },
                                  {
                                    text: "Demonstration",
                                    sub: "Praktik Whip Pan & Morph Transition",
                                    icon: Video,
                                    color: "bg-blue-500/20 text-blue-500",
                                  },
                                  {
                                    text: "Demonstration",
                                    sub: "Praktik The Cutout & Block Cut",
                                    icon: Layers,
                                    color: "bg-purple-500/20 text-purple-500",
                                  },
                                  {
                                    text: "Demonstration",
                                    sub: "Praktik Hard Cut",
                                    icon: Camera,
                                    color: "bg-orange-500/20 text-orange-500",
                                  },
                                  {
                                    text: "Penutup (CTA)",
                                    sub: "Follow akun Semarak Media",
                                    icon: Users,
                                    color: "bg-cyan-500/20 text-cyan-500",
                                  },
                                ].map((step, idx, arr) => (
                                  <div key={idx} className="relative">
                                    <motion.div
                                      initial={{ opacity: 0, x: 20 }}
                                      whileInView={{ opacity: 1, x: 0 }}
                                      viewport={{ once: true }}
                                      transition={{ delay: idx * 0.1 }}
                                      className="flex items-center gap-4 p-5 rounded-2xl bg-black/40 border border-white/5 hover:border-white/10 transition-colors group"
                                    >
                                      <div
                                        className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${step.color}`}
                                      >
                                        <step.icon className="w-6 h-6" />
                                      </div>
                                      <div>
                                        <p className="text-sm font-bold text-white uppercase tracking-tight">
                                          {step.text}
                                        </p>
                                        <p className="text-[11px] text-zinc-500 font-mono italic group-hover:text-zinc-400 transition-colors">
                                          {step.sub}
                                        </p>
                                      </div>
                                      <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Sparkles className="w-4 h-4 text-emerald-500" />
                                      </div>
                                    </motion.div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </section>

                      <section className="space-y-12 pb-12">
                        <div className="flex flex-col gap-8">
                          <div className="space-y-2">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 text-[10px] font-mono tracking-widest uppercase">
                              Content Management
                            </div>
                            <h3 className="text-3xl font-display font-medium text-white">
                              Scheduling & Organized The Content
                            </h3>
                            <p className="text-zinc-400 leading-relaxed max-w-3xl font-light">
                              To ensure efficient content management and
                              scheduling, I leverage Trello, a robust platform
                              that facilitates the organization of content into
                              distinct stages, including{" "}
                              <span className="text-white font-medium">
                                "TO-DO" → "ONGOING" → "DONE"
                              </span>
                              . This structured approach enables effective
                              tracking and timely delivery of pre-planned
                              content.
                            </p>
                          </div>

                          <div className="relative group max-w-5xl mx-auto w-full">
                            {/* Monitor Mockup Container */}
                            <div className="relative pt-[2%] px-[1.5%] pb-[6%] bg-[#1a1a1a] rounded-[2rem] border border-white/10 shadow-2xl overflow-hidden shadow-orange-500/5">
                              {/* Screen Glass Effect */}
                              <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none z-10" />

                              {/* The Content */}
                              <div 
                                className="relative rounded-lg overflow-hidden border border-white/5 bg-zinc-950 cursor-zoom-in"
                                onClick={() => setSelectedPreviewImage("/Cozyon-Trello.png")}
                              >
                                <img
                                  src="/Cozyon-Trello.png"
                                  alt="Trello Content Workflow"
                                  className="w-full h-auto object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-700"
                                  referrerPolicy="no-referrer"
                                />
                              </div>

                              {/* Bottom Bezel Decoration */}
                              <div className="absolute bottom-[1.5%] left-1/2 -translate-x-1/2 flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-zinc-700" />
                                <div className="w-8 h-1 rounded-full bg-zinc-800" />
                                <div className="w-1.5 h-1.5 rounded-full bg-zinc-700" />
                              </div>
                            </div>

                            {/* Monitor Stand */}
                            <div className="relative flex flex-col items-center -mt-1 group-hover:mt-0 transition-all duration-500">
                              <div className="w-24 h-12 bg-gradient-to-b from-[#222] to-[#111] border-x border-white/5" />
                              <div className="w-48 h-2 bg-gradient-to-r from-transparent via-[#333] to-transparent" />
                              <div className="w-56 h-4 bg-zinc-900 rounded-full blur-md opacity-50 absolute -bottom-2" />
                            </div>

                            {/* Feature Tags */}
                            <div className="absolute -bottom-4 -right-4 flex items-center gap-4 bg-zinc-950/80 backdrop-blur-xl p-4 rounded-2xl border border-white/10 shadow-2xl z-20">
                              <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center text-black">
                                <Layout className="w-5 h-5" />
                              </div>
                              <div className="space-y-0.5">
                                <p className="text-xs font-bold text-white uppercase tracking-tight">
                                  Workflow Orchestration
                                </p>
                                <p className="text-[10px] text-zinc-500 font-mono">
                                  Status Tracking & Milestone Management
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </section>

                      <section className="space-y-12 pb-24 lg:pb-32">
                        <div className="flex flex-col lg:flex-row items-center gap-20 lg:gap-12">
                          {/* Images Side - Overlapping Layout Inspired by Reference */}
                          <div className="relative w-full lg:w-3/5 min-h-[350px] sm:min-h-[450px] md:min-h-0 aspect-[4/3] sm:aspect-video lg:aspect-[16/9] flex items-center justify-center">
                            {/* Background Glow */}
                            <div className="absolute inset-0 bg-purple-500/5 blur-[100px] rounded-full" />

                            {/* Content Calendar 2 (Behind/Left) */}
                            <motion.div
                              initial={{ opacity: 0, x: -50, rotate: -2 }}
                              whileInView={{ opacity: 1, x: 0, rotate: -2 }}
                              viewport={{ once: true }}
                              whileHover={{
                                scale: 1.05,
                                zIndex: 30,
                                rotate: 0,
                              }}
                              onClick={() => setSelectedPreviewImage("/Content-Calendar-2.png")}
                              className="absolute left-0 top-10 w-2/3 z-10 cursor-zoom-in transition-all duration-300"
                            >
                              <img
                                src="/Content-Calendar-2.png"
                                alt="Content Calendar Planning"
                                className="w-full h-auto rounded-2xl shadow-2xl"
                                referrerPolicy="no-referrer"
                              />
                            </motion.div>

                            {/* Content Calendar 1 (Front/Right) */}
                            <motion.div
                              initial={{ opacity: 0, x: 50, rotate: 2 }}
                              whileInView={{ opacity: 1, x: 0, rotate: 2 }}
                              viewport={{ once: true }}
                              whileHover={{
                                scale: 1.05,
                                zIndex: 30,
                                rotate: 0,
                              }}
                              onClick={() => setSelectedPreviewImage("/Content-Calendar.png")}
                              className="absolute right-0 bottom-0 w-3/4 z-20 cursor-zoom-in transition-all duration-300"
                            >
                              <img
                                src="/Content-Calendar.png"
                                alt="Content Calendar Execution"
                                className="w-full h-auto rounded-2xl shadow-2xl"
                                referrerPolicy="no-referrer"
                              />
                            </motion.div>
                          </div>

                          {/* Text Side */}
                          <div className="w-full lg:w-2/5 space-y-6">
                            <div className="space-y-4">
                              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-500 text-[10px] font-mono tracking-widest uppercase">
                                End-to-End Planning
                              </div>
                              <h3 className="text-4xl font-display font-medium text-white leading-tight">
                                Scheduling The Content
                              </h3>
                              <p className="text-zinc-400 leading-relaxed font-light text-lg">
                                A visualization of my comprehensive content
                                calendar system. This map illustrates the
                                end-to-end journey from initial ideation to
                                final publication, ensuring every piece of
                                content is strategically timed for maximum
                                impact.
                              </p>
                              <div className="flex flex-wrap gap-3 pt-4">
                                <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-mono text-zinc-400 uppercase tracking-widest">
                                  Planning
                                </div>
                                <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-mono text-zinc-400 uppercase tracking-widest">
                                  In-Progress
                                </div>
                                <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-mono text-zinc-400 uppercase tracking-widest">
                                  Scheduled
                                </div>
                                <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-mono text-zinc-400 uppercase tracking-widest">
                                  Published
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </section>

                      <section className="space-y-12 pt-12 pb-12">
                        <div className="flex flex-col gap-8">
                          <div className="space-y-2">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-mono tracking-widest uppercase">
                              Automation
                            </div>
                            <h3 className="text-3xl font-display font-medium text-white">
                              Set Auto Posting The Content
                            </h3>
                            <p className="text-zinc-400 leading-relaxed max-w-3xl font-light">
                              Utilizing TikTok Studio for automated deployment.
                              By pre-scheduling content, I maintain a consistent
                              presence without manual intervention, allowing for
                              more focus on creative strategy.
                            </p>
                          </div>

                          <div className="relative group max-w-5xl mx-auto w-full">
                            {/* Monitor Mockup Container */}
                            <div className="relative pt-[2%] px-[1.5%] pb-[6%] bg-[#1a1a1a] rounded-[2rem] border border-white/10 shadow-2xl overflow-hidden shadow-red-500/5">
                              {/* Screen Glass Effect */}
                              <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none z-10" />

                              {/* The Content */}
                              <div className="relative rounded-lg overflow-hidden border border-white/5 bg-zinc-950">
                                <img
                                  src="/TikTok-Studio-Cozyon.png"
                                  alt="TikTok Studio Auto Posting"
                                  className="w-full h-auto object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-700"
                                />

                                {/* Status Overlay */}
                                <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1 bg-zinc-950/80 backdrop-blur-md rounded-full border border-white/10 z-20">
                                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                  <span className="text-[9px] font-mono text-zinc-300 font-bold tracking-widest uppercase">
                                    Auto Posting Scheduled
                                  </span>
                                </div>
                              </div>

                              {/* Bottom Bezel Decoration */}
                              <div className="absolute bottom-[1.5%] left-1/2 -translate-x-1/2 flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-zinc-700" />
                                <div className="w-8 h-1 rounded-full bg-zinc-800" />
                                <div className="w-1.5 h-1.5 rounded-full bg-zinc-700" />
                              </div>
                            </div>

                            {/* Monitor Stand */}
                            <div className="relative flex flex-col items-center -mt-1 group-hover:mt-0 transition-all duration-500">
                              <div className="w-24 h-12 bg-gradient-to-b from-[#222] to-[#111] border-x border-white/5" />
                              <div className="w-48 h-2 bg-gradient-to-r from-transparent via-[#333] to-transparent" />
                              <div className="w-56 h-4 bg-zinc-900 rounded-full blur-md opacity-50 absolute -bottom-2" />
                            </div>

                            {/* Feature Tags */}
                            <div className="absolute -bottom-4 -left-4 flex items-center gap-4 bg-zinc-950/80 backdrop-blur-xl p-4 rounded-2xl border border-white/10 shadow-2xl z-20">
                              <div className="w-10 h-10 rounded-xl bg-red-500 flex items-center justify-center text-white">
                                <Send className="w-5 h-5" />
                              </div>
                              <div className="space-y-0.5">
                                <p className="text-xs font-bold text-white uppercase tracking-tight">
                                  TikTok Studio Integration
                                </p>
                                <p className="text-[10px] text-zinc-500 font-mono">
                                  Optimized Posting Window & Audience Retention
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </section>

                      <section className="space-y-12">
                        <div className="flex flex-col gap-6">
                          <div className="space-y-2">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-500 text-[10px] font-mono tracking-widest uppercase">
                              Interactive Demo Project
                            </div>
                            <h3 className="text-3xl font-display font-medium text-white">
                              AI Content ATM Generator
                            </h3>
                            <p className="text-zinc-400 leading-relaxed max-w-3xl font-light">
                              A powerful AI-driven solution that streamlines content
                              creation by transcribing TikTok scripts and enabling
                              seamless modification using the{" "}
                              <span className="text-white font-medium">
                                ATM (Observe, Imitate, Modify)
                              </span>{" "}
                              framework. This is demonstrating how I leverage AI technology
                              to accelerate professional workflows and creative
                              output.
                            </p>
                          </div>

                          <div className="w-full rounded-[2.5rem] bg-zinc-900/50 border border-white/10 overflow-hidden relative group p-6 md:p-10 space-y-8">
                            <div className="absolute inset-0 bg-gradient-to-tr from-orange-500/5 to-transparent pointer-events-none" />

                            <div className="relative z-10 flex flex-col gap-6">
                              <div className="flex flex-col md:flex-row gap-4">
                                <input
                                  type="text"
                                  placeholder="Paste your TikTok video link here..."
                                  value={tiktokUrl}
                                  onChange={(e) => setTiktokUrl(e.target.value)}
                                  className="flex-1 px-6 py-4 rounded-2xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-orange-500/50 transition-colors"
                                />
                                <button
                                  onClick={handleAtmGenerator}
                                  disabled={isGenerating || !tiktokUrl}
                                  className="px-8 py-4 bg-orange-500 text-black font-bold rounded-2xl hover:bg-orange-400 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group/btn"
                                >
                                  {isGenerating ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                  ) : (
                                    <Sparkles className="w-5 h-5 group-hover/btn:animate-pulse" />
                                  )}
                                  <span className="uppercase tracking-widest text-xs">
                                    Generate ATM Script
                                  </span>
                                </button>
                              </div>

                              {atmResult && (
                                <>
                                  <motion.div
                                  initial={{ opacity: 0, y: 20 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-8 mt-4"
                                >
                                  {/* Video Preview & Stats */}
                                  <div className="space-y-6">
                                    <div className="relative aspect-[9/16] rounded-2xl overflow-hidden bg-black border border-white/10 group/vid">
                                      {atmResult.metadata.videoUrl &&
                                      !videoError ? (
                                        <div className="w-full h-full relative">
                                          <video
                                            key={`${atmResult.metadata.id}-native`}
                                            src={`/api/video-proxy?url=${encodeURIComponent(atmResult.metadata.videoUrl)}`}
                                            className="w-full h-full object-cover"
                                            controls
                                            autoPlay
                                            muted
                                            playsInline
                                            onError={() => setVideoError(true)}
                                          />
                                        </div>
                                      ) : (
                                        <iframe
                                          title="TikTok Embed"
                                          src={`https://www.tiktok.com/embed/v2/${atmResult.metadata.id}`}
                                          className="w-full h-full border-none"
                                          allow="autoplay; encrypted-media"
                                        />
                                      )}
                                    </div>

                                    {/* Stats Grid */}
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                      {[
                                        {
                                          icon: Play,
                                          label: "Views",
                                          val: atmResult.metadata.stats.views.toLocaleString(),
                                        },
                                        {
                                          icon: Heart,
                                          label: "Likes",
                                          val: atmResult.metadata.stats.likes.toLocaleString(),
                                        },
                                        {
                                          icon: MessageCircle,
                                          label: "Comments",
                                          val: atmResult.metadata.stats.comments.toLocaleString(),
                                        },
                                        {
                                          icon: Bookmark,
                                          label: "Saves",
                                          val: atmResult.metadata.stats.saves.toLocaleString(),
                                        },
                                        {
                                          icon: Share2,
                                          label: "Shares",
                                          val: atmResult.metadata.stats.shares.toLocaleString(),
                                        },
                                        {
                                          icon: BarChart3,
                                          label: "Engagement",
                                          val: "High",
                                        },
                                      ].map((stat, i) => (
                                        <div
                                          key={i}
                                          className="p-3 rounded-xl bg-black/40 border border-white/5 flex flex-col gap-1"
                                        >
                                          <div className="flex items-center gap-2 text-zinc-500">
                                            <stat.icon className="w-3 h-3" />
                                            <span className="text-[10px] font-mono uppercase">
                                              {stat.label}
                                            </span>
                                          </div>
                                          <p className="text-xs font-bold text-white">
                                            {stat.val}
                                          </p>
                                        </div>
                                      ))}
                                    </div>

                                    {/* Structure Analysis */}
                                    <div className="p-4 rounded-xl bg-zinc-900/80 border border-white/5 space-y-4">
                                      <div className="flex items-center gap-2 text-orange-500">
                                        <BarChart3 className="w-4 h-4" />
                                        <h4 className="text-[10px] font-mono uppercase tracking-[0.2em] font-bold">
                                          Structure Analysis
                                        </h4>
                                      </div>

                                      <div className="space-y-3">
                                        <div className="space-y-1">
                                          <span className="text-[9px] text-zinc-500 uppercase font-mono">
                                            Hook Strategy
                                          </span>
                                          <p className="text-xs text-white font-medium">
                                            {atmResult.hook}
                                          </p>
                                        </div>
                                        <div className="space-y-1">
                                          <span className="text-[9px] text-zinc-500 uppercase font-mono">
                                            Video Structure
                                          </span>
                                          <div className="flex flex-wrap gap-1 items-center">
                                            {atmResult.structure
                                              .split("->")
                                              .map((step, sidx) => (
                                                <React.Fragment key={sidx}>
                                                  <span className="px-2 py-0.5 rounded bg-white/5 text-[9px] text-zinc-300 font-mono border border-white/5 whitespace-nowrap">
                                                    {step.trim()}
                                                  </span>
                                                  {sidx <
                                                    atmResult.structure.split(
                                                      "->",
                                                    ).length -
                                                      1 && (
                                                    <ChevronRight className="w-2 h-2 text-zinc-600" />
                                                  )}
                                                </React.Fragment>
                                              ))}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Scripts */}
                                  <div className="space-y-6">
                                    <div className="p-6 rounded-2xl bg-black/40 border border-white/5 space-y-4">
                                      <div className="flex items-center justify-between">
                                        <h4 className="text-sm font-mono text-zinc-400 uppercase tracking-widest">
                                          Original Transcript
                                        </h4>
                                        <button
                                          onClick={() =>
                                            handleCopy(
                                              atmResult.original,
                                              "copy-orig",
                                            )
                                          }
                                          className="text-zinc-600 hover:text-orange-500 transition-colors"
                                        >
                                          <Copy className="w-4 h-4" />
                                        </button>
                                      </div>
                                      <p className="text-sm text-zinc-300 leading-relaxed italic line-clamp-6">
                                        {atmResult.original}
                                      </p>
                                    </div>

                                    <div className="p-6 rounded-3xl bg-orange-500/5 border border-orange-500/20 space-y-6 relative overflow-hidden group/atm">
                                      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover/atm:opacity-10 transition-opacity">
                                        <Sparkles className="w-12 h-12 text-orange-500" />
                                      </div>
                                      <div className="flex items-center justify-between relative z-10">
                                        <div className="flex items-center gap-2">
                                          <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center text-black">
                                            <Zap className="w-4 h-4" />
                                          </div>
                                          <h4 className="text-lg font-bold text-white uppercase tracking-tighter">
                                            ATM Modified Script
                                          </h4>
                                        </div>
                                        <button
                                          onClick={() =>
                                            handleCopy(
                                              atmResult.atm,
                                              "copy-atm",
                                            )
                                          }
                                          className="p-2 bg-orange-500/10 rounded-lg text-orange-500 hover:bg-orange-500 hover:text-black transition-all"
                                        >
                                          <Copy className="w-4 h-4" />
                                        </button>
                                      </div>
                                      <div className="space-y-4 relative z-10">
                                        <p className="text-base text-zinc-100 leading-relaxed font-medium">
                                          {atmResult.atm}
                                        </p>
                                        <div className="flex gap-4 pt-4 border-t border-orange-500/10">
                                          <span className="text-[10px] font-mono text-orange-500/60 font-bold uppercase tracking-widest">
                                            Optimized Hook ✓
                                          </span>
                                          <span className="text-[10px] font-mono text-orange-500/60 font-bold uppercase tracking-widest">
                                            Strong CTA ✓
                                          </span>
                                        </div>
                                      </div>
                                    </div>

                                    {/* 3. MODIFIKASI (OVERVIEW) Section */}
                                    {atmResult.modifikasi && (
                                      <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="p-8 rounded-[2rem] bg-indigo-500/5 border border-indigo-500/20 space-y-6 relative overflow-hidden group/mod"
                                      >
                                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover/mod:opacity-10 transition-opacity pointer-events-none">
                                          <Palette className="w-24 h-24 text-indigo-500" />
                                        </div>
                                        <div className="flex items-center gap-3 text-indigo-400 mb-2 relative z-10">
                                          <div className="w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center text-black shadow-lg shadow-indigo-500/20">
                                            <Palette className="w-5 h-5" />
                                          </div>
                                          <div>
                                            <h4 className="text-xl font-bold uppercase tracking-tight text-white">
                                              3. MODIFIKASI (OVERVIEW)
                                            </h4>
                                            <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-indigo-500/60 mt-0.5">
                                              Optimization & Creative Strategy
                                            </p>
                                          </div>
                                        </div>

                                        <div className="space-y-6 relative z-10">
                                          <div className="space-y-3">
                                            <div className="flex items-center gap-2">
                                              <Zap className="w-3 h-3 text-indigo-500" />
                                              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest font-bold">
                                                Recommended Hook
                                              </span>
                                            </div>
                                            <div className="p-6 rounded-2xl bg-black/60 border border-white/5 text-xl font-bold text-white italic leading-relaxed shadow-inner">
                                              "{atmResult.modifikasi.recommendedHook}"
                                            </div>
                                          </div>

                                          <div className="space-y-4 pt-4 border-t border-white/5">
                                            <div className="flex items-center gap-2">
                                              <Layers className="w-3 h-3 text-indigo-500" />
                                              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest font-bold">
                                                Strategi Peningkatan
                                              </span>
                                            </div>
                                            <div className="grid grid-cols-1 gap-3">
                                              {atmResult.modifikasi.strategies.map(
                                                (strat, sidx) => (
                                                  <div
                                                    key={sidx}
                                                    className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/5 hover:border-indigo-500/30 hover:bg-indigo-500/5 transition-all group/strat"
                                                  >
                                                    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-black text-indigo-500 flex items-center justify-center text-sm font-bold font-mono group-hover/strat:bg-indigo-500 group-hover/strat:text-black transition-all">
                                                      {sidx + 1}
                                                    </div>
                                                    <p className="text-sm text-zinc-300 leading-relaxed pt-1.5">
                                                      {strat}
                                                    </p>
                                                  </div>
                                                ),
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                      </motion.div>
                                    )}
                                  </div>
                                </motion.div>

                                {/* Content Brief Outline - Full Width */}
                                {atmResult.brief && (
                                  <motion.div
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="relative mt-12 overflow-hidden rounded-[3rem] bg-zinc-900 border border-white/5 p-8 md:p-12 shadow-2xl"
                                  >
                                    <div className="absolute right-0 top-0 opacity-[0.03] p-12 -mr-12 -mt-12 pointer-events-none">
                                      <Layout className="h-64 w-64 text-orange-500" />
                                    </div>

                                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-10 mb-10">
                                      <div className="flex items-center gap-6">
                                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-500 text-black shadow-lg shadow-orange-500/20">
                                          <BookOpen className="h-8 w-8" />
                                        </div>
                                        <div>
                                          <h4 className="text-3xl font-display font-bold uppercase tracking-tight text-white mb-2">
                                            Content Brief Outline
                                          </h4>
                                          <div className="flex items-center gap-3">
                                            <span className="px-3 py-1 rounded-full bg-orange-500/10 text-orange-500 text-[10px] font-mono font-bold uppercase tracking-widest border border-orange-500/20">
                                              Production Masterplan
                                            </span>
                                            <span className="text-zinc-500 text-[10px] uppercase font-mono tracking-widest">
                                              Strategy & Visual Direction
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                    </div>

                                    <div className="space-y-8">
                                      {/* Vertical Stack Sections */}
                                      {[
                                        {
                                          label: "On-Screen Text (Overlay)",
                                          val: atmResult.brief.onScreenText,
                                          icon: Type,
                                        },
                                        {
                                          label: "Required Scene Locations",
                                          val: atmResult.brief.locations,
                                          icon: MapPin,
                                        },
                                        {
                                          label: "Angle & Shot List",
                                          val: atmResult.brief.shotList,
                                          icon: Camera,
                                        },
                                        {
                                          label: "Scene Sequence",
                                          val: atmResult.brief.sequence,
                                          icon: Layers,
                                        },
                                      ].map((item, idx) => (
                                        <div
                                          key={idx}
                                          className="group/item relative"
                                        >
                                          <div className="flex items-center gap-3 text-orange-500 mb-4 px-2">
                                            <div className="p-1.5 rounded-lg bg-orange-500/10 border border-orange-500/20 group-hover/item:bg-orange-500 group-hover/item:text-black transition-all">
                                              <item.icon className="h-3.5 w-3.5" />
                                            </div>
                                            <h5 className="font-mono text-[11px] uppercase tracking-[0.2em] font-bold">
                                              {item.label}
                                            </h5>
                                          </div>
                                          <div className="relative rounded-[2rem] bg-black/40 p-8 border border-white/5 text-zinc-300 leading-relaxed shadow-inner group-hover/item:border-orange-500/20 transition-colors">
                                            {item.label === "On-Screen Text (Overlay)" ? (
                                              <div className="grid grid-cols-1 gap-4">
                                                {item.val.split("\n").filter(line => line.trim()).map((line, lidx) => {
                                                  const parts = line.split("|").map(s => s.trim());
                                                  const mainText = parts[0].replace(/^[•\-\*]\s*/, "");
                                                  const tipsText = parts.length > 1 ? parts[1] : "";
                                                  
                                                  return (
                                                    <div key={lidx} className="p-6 rounded-2xl bg-zinc-900/50 border border-white/10 hover:border-orange-500/30 transition-all group/card shadow-sm">
                                                      <p className="text-lg font-bold text-white mb-3 leading-tight font-display tracking-tight uppercase italic">
                                                        "{mainText}"
                                                      </p>
                                                      {tipsText && (
                                                        <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-orange-500/5 border border-orange-500/10 w-fit">
                                                          <Lightbulb className="w-3.5 h-3.5 text-orange-400 fill-orange-400/20" />
                                                          <span className="text-[11px] font-medium text-orange-500/80 italic">
                                                            {tipsText}
                                                          </span>
                                                        </div>
                                                      )}
                                                    </div>
                                                  );
                                                })}
                                              </div>
                                            ) : item.label === "Scene Sequence" ? (
                                              <div className="grid grid-cols-1 gap-4">
                                                {item.val.split("\n").filter(line => line.trim()).map((line, lidx) => {
                                                  const parts = line.split("|").map(s => s.trim());
                                                  const title = parts[0].replace(/^[•\-\*\d\.]+\s*/, "");
                                                  const description = parts.length > 1 ? parts[1] : "";
                                                  
                                                  return (
                                                    <div key={lidx} className="flex gap-6 p-6 rounded-2xl bg-zinc-900/50 border border-white/10 hover:border-orange-500/30 transition-all group/scene">
                                                      <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-400 font-bold group-hover/scene:bg-orange-500 group-hover/scene:text-black transition-all">
                                                        {lidx + 1}
                                                      </div>
                                                      <div className="space-y-1">
                                                        <h6 className="text-lg font-bold text-white group-hover/scene:text-orange-500 transition-colors">
                                                          {title}
                                                        </h6>
                                                        <p className="text-sm text-zinc-400 leading-relaxed">
                                                          {description}
                                                        </p>
                                                      </div>
                                                    </div>
                                                  );
                                                })}
                                              </div>
                                            ) : (
                                              <div className="space-y-3 text-sm md:text-base">
                                                {item.val.split("\n").filter(line => line.trim()).map((line, lidx) => (
                                                  <div key={lidx} className="flex gap-3">
                                                    <span className="text-orange-500 mt-1.5 flex-shrink-0">•</span>
                                                    <span>{line.replace(/^[•\-\*]\s*/, "")}</span>
                                                  </div>
                                                ))}
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      ))}
                                    </div>

                                    <div className="mt-12 pt-10 border-t border-white/5">
                                      <div className="flex items-center gap-4 mb-8">
                                        <Zap className="h-4 w-4 text-orange-500" />
                                        <h5 className="font-mono text-[10px] font-bold uppercase tracking-[0.4em] text-white/40">
                                          Post-Production Notes
                                        </h5>
                                      </div>
                                      
                                      <div className="flex flex-col gap-4">
                                        {/* Row 1: 3 items */}
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                          {[
                                            {
                                              label: "Music",
                                              val: atmResult.brief?.editingNotes.music || "",
                                              icon: AudioLines,
                                            },
                                            {
                                              label: "Transitions",
                                              val: atmResult.brief?.editingNotes.transitions || "",
                                              icon: Layers,
                                            },
                                            {
                                              label: "Subtitles",
                                              val: atmResult.brief?.editingNotes.subtitles || "",
                                              icon: Quote,
                                            },
                                          ].map((note, nidx) => (
                                            <div
                                              key={nidx}
                                              className="group/note flex flex-col gap-4 rounded-3xl border border-white/5 bg-zinc-900/50 p-6 transition-all hover:bg-orange-500/5 hover:border-orange-500/20 shadow-lg"
                                            >
                                              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black group-hover/note:bg-orange-500 group-hover/note:text-black text-orange-500 transition-all font-bold">
                                                <note.icon className="h-4 w-4" />
                                              </div>
                                              <div className="space-y-1">
                                                <p className="font-mono text-[8.5px] uppercase tracking-[0.2em] text-zinc-500">
                                                  {note.label}
                                                </p>
                                                <p className="text-[11px] font-medium text-white/90 leading-relaxed">
                                                  {note.val}
                                                </p>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                        
                                        {/* Row 2: 2 items */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                          {[
                                            {
                                              label: "Pace",
                                              val: atmResult.brief?.editingNotes.pace || "",
                                              icon: Zap,
                                            },
                                            {
                                              label: "VFX & GFX",
                                              val: atmResult.brief?.editingNotes.effects || "",
                                              icon: Sparkles,
                                            },
                                          ].map((note, nidx) => (
                                            <div
                                              key={nidx}
                                              className="group/note flex flex-col gap-4 rounded-3xl border border-white/5 bg-zinc-900/50 p-6 transition-all hover:bg-orange-500/5 hover:border-orange-500/20 shadow-lg"
                                            >
                                              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black group-hover/note:bg-orange-500 group-hover/note:text-black text-orange-500 transition-all font-bold">
                                                <note.icon className="h-4 w-4" />
                                              </div>
                                              <div className="space-y-1">
                                                <p className="font-mono text-[8.5px] uppercase tracking-[0.2em] text-zinc-500">
                                                  {note.label}
                                                </p>
                                                <p className="text-[11px] font-medium text-white/90 leading-relaxed">
                                                  {note.val}
                                                </p>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    </div>
                                  </motion.div>
                                )}
                              </>
                            )}
                            </div>
                          </div>
                        </div>
                      </section>
                    </div>
                  ) : selectedCategory === "video" ? (
                    <div className="space-y-24 pt-12 border-t border-white/5">
                      {/* Video Player Display */}
                      <section className="space-y-12">
                        <div className="p-8 md:p-12 rounded-[2.5rem] bg-zinc-900/30 border border-white/5 relative overflow-hidden group">
                          <div className="absolute top-0 left-0 w-64 h-64 bg-orange-500/5 blur-3xl rounded-full" />
                          
                          <div className="relative z-10 flex flex-col gap-24">
                            <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-12 items-center">
                              {/* Video on Left */}
                              <div className="relative group/video overflow-hidden rounded-[2.5rem] bg-black border border-white/10 aspect-[9/16] w-full max-w-[280px] mx-auto md:mx-0">
                                  <video
                                    className="w-full h-full object-cover opacity-60 transition-opacity duration-300 group-hover/video:opacity-100"
                                    playsInline
                                    preload="metadata"
                                  >
                                    <source src="/Semarak-Trailer-1.mp4#t=0.1" type="video/mp4" />
                                  </video>
                                  <div
                                    className="absolute inset-0 z-20 flex items-center justify-center bg-black/20 group-hover/video:bg-black/40 transition-colors cursor-pointer"
                                    onClick={() => setCinemaModeVideo("/Semarak-Trailer-1.mp4")}
                                  >
                                    <motion.div
                                      whileHover={{ scale: 1.1 }}
                                      whileTap={{ scale: 0.9 }}
                                      className="w-16 h-16 rounded-full bg-orange-500 text-black flex items-center justify-center shadow-[0_0_40px_rgba(249,115,22,0.6)]"
                                    >
                                      <Play className="w-6 h-6 fill-current translate-x-1" />
                                    </motion.div>
                                  </div>
                              </div>
                              
                              {/* Text on Right */}
                              <div className="space-y-6">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-500 text-[10px] font-mono tracking-widest uppercase">
                                  Showcase Video 1
                                </div>
                                <h3 className="text-3xl md:text-5xl font-display font-medium text-white leading-tight">
                                  The Deadline <br /> Semarak Media Trailer
                                </h3>
                                <p className="text-zinc-400 leading-relaxed max-w-2xl font-light text-lg">
                                  An intense, fast-paced mock movie trailer dissecting the pressure of content creation deadlines, utilizing sharp cuts, dramatic narration, and high-tension progression.
                                </p>
                              </div>
                            </div>
                            
                            {/* Technical Deep Dive */}
                            <div className="space-y-12">
                               <div className="flex flex-col gap-4">
                                 <div className="inline-flex self-start items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-500 text-[10px] font-mono tracking-widest uppercase">
                                   Deep Dive
                                 </div>
                                 <h3 className="text-3xl font-display font-medium text-white">
                                   Editing Technique Breakdown
                                 </h3>
                               </div>

                             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                               {/* Breakdown list */}
                               <div className="space-y-6">
                                 <h4 className="text-lg font-bold text-white tracking-widest uppercase font-display border-b border-white/10 pb-4">
                                   Visual & Transitions
                                 </h4>
                                 <ul className="space-y-4">
                                   <li className="flex gap-4">
                                     <div className="p-2 rounded-lg bg-orange-500/10 h-fit">
                                       <Video className="w-4 h-4 text-orange-500" />
                                     </div>
                                     <div>
                                        <p className="text-sm font-bold text-white mb-1 uppercase tracking-wider">Fast-Paced Action</p>
                                        <p className="text-xs text-zinc-500 leading-relaxed font-light">Rapid cuts mapped exactly to the narration beats. Fokus transisi dibuat menghentak (hard cuts & J-cuts) untuk menciptakan ilusi waktu yang semakin menipis (deadline effect).</p>
                                     </div>
                                   </li>
                                   <li className="flex gap-4">
                                     <div className="p-2 rounded-lg bg-emerald-500/10 h-fit">
                                       <Camera className="w-4 h-4 text-emerald-500" />
                                     </div>
                                     <div>
                                        <p className="text-sm font-bold text-white mb-1 uppercase tracking-wider">Angle & Storyboard</p>
                                        <p className="text-xs text-zinc-500 leading-relaxed font-light">Pengambilan angle close-up wajah dan ekspresi kepanikan untuk menonjolkan stres karakter. Storyboard tersusun secara terstruktur memuncak pada klimaks saat teguran "Guys, ini kontennya belum ada yang selesai, gimana sih!"</p>
                                     </div>
                                   </li>
                                   <li className="flex gap-4">
                                     <div className="p-2 rounded-lg bg-blue-500/10 h-fit">
                                       <Palette className="w-4 h-4 text-blue-500" />
                                     </div>
                                     <div>
                                        <p className="text-sm font-bold text-white mb-1 uppercase tracking-wider">Color Grading & Lighting</p>
                                        <p className="text-xs text-zinc-500 leading-relaxed font-light">Dominasi warna-warna dingin dan kontras tinggi. Pencahayaan diatur minim (low-key lighting) ala sinematik thriller untuk menekankan urgensi bahwa mereka "belum tidur 3 hari".</p>
                                     </div>
                                   </li>
                                   <li className="flex gap-4">
                                     <div className="p-2 rounded-lg bg-purple-500/10 h-fit">
                                       <Sparkles className="w-4 h-4 text-purple-500" />
                                     </div>
                                     <div>
                                        <p className="text-sm font-bold text-white mb-1 uppercase tracking-wider">Effects & SFX</p>
                                        <p className="text-xs text-zinc-500 leading-relaxed font-light">Pemakaian sound effect detak jam, typing glitch, dan swoosh transition untuk membumbui adrenalin. Visual effects dipake seperlunya untuk tidak merusak feel sinematik.</p>
                                     </div>
                                   </li>
                                 </ul>
                                 
                                 {/* Move Tools here inside left column of Deep dive or maybe spread across */}
                               </div>

                               {/* Concept & Narrative Strategy */}
                               <div className="space-y-8">
                                 <div className="p-6 rounded-2xl bg-black border border-white/5 space-y-4">
                                   <div className="flex items-center gap-3 mb-2">
                                     <MessageSquare className="w-5 h-5 text-zinc-300" />
                                     <h4 className="text-sm font-bold text-white uppercase tracking-widest">Concept & Narrative</h4>
                                   </div>
                                    <div className="p-4 rounded-xl bg-orange-500/5 border border-orange-500/20">
                                      <p className="text-[11px] text-orange-200 leading-relaxed italic">
                                        "Mereka punya tiga jam untuk menyelamatkan dunia. Dunia konten. Satu penulis naskah, satu desainer, dan satu editor yang belum tidur, tiga hari. Mereka tak bisa mundur karena kalau telat... (Suara wanita: Guys, ini kontennya belum ada yang selesai, gimana sih!) Algoritma tidak akan memaafkan. Semarak Media Presents, THE DEADLINE."
                                      </p>
                                    </div>
                                 </div>
                                 
                                 <div className="p-6 rounded-2xl bg-black border border-white/5 space-y-4">
                                   <div className="flex items-center gap-3 mb-2">
                                     <Brain className="w-5 h-5 text-zinc-300" />
                                     <h4 className="text-sm font-bold text-white uppercase tracking-widest">Narration Strategy</h4>
                                   </div>
                                    <p className="text-xs text-zinc-500 leading-relaxed">
                                      Pendekatan ala narator film action (Voice of God) yang bombastis, mendadak dirusak oleh komedi intrusi dari atas (suara klien/manajer: "Guys, ini kontennya belum ada yang selesai..."). Strategi kontras ini membangun tensi serius kemudian memecahnya menjadi sebuah komedi relatable bagi praktisi agensi.
                                    </p>
                                 </div>
                                 
                                 <div className="p-6 rounded-2xl bg-black border border-white/5 space-y-4">
                                   <div className="flex items-center gap-3 mb-2">
                                     <Layers className="w-5 h-5 text-zinc-300" />
                                     <h4 className="text-sm font-bold text-white uppercase tracking-widest">Tools</h4>
                                   </div>
                                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                                     <div className="p-4 rounded-xl bg-zinc-900 border border-white/5 flex gap-3 hover:border-[#312563]/50 transition-colors w-full overflow-hidden">
                                        <div className="w-10 h-10 bg-[#312563] text-white flex items-center justify-center font-bold text-lg rounded-lg shrink-0">Pr</div>
                                        <span className="text-[10px] uppercase tracking-widest font-bold text-zinc-400 self-center truncate">Premiere Pro</span>
                                     </div>
                                     <div className="p-4 rounded-xl bg-zinc-900 border border-white/5 flex gap-3 hover:border-white/50 transition-colors w-full overflow-hidden">
                                        <div className="w-10 h-10 bg-white text-black flex items-center justify-center font-bold text-lg rounded-lg shrink-0">C</div>
                                        <span className="text-[10px] uppercase tracking-widest font-bold text-zinc-400 self-center truncate">Capcut Desktop</span>
                                     </div>
                                   </div>
                                 </div>
                               </div>
                             </div>
                           </div>
                         </div>
                       </div>
                     </section>

                      {/* Video Player Display 2 */}
                      <section className="space-y-12 pb-12">
                        <div className="p-8 md:p-12 rounded-[2.5rem] bg-zinc-900/30 border border-white/5 relative overflow-hidden group">
                          <div className="absolute top-1/2 right-0 w-64 h-64 bg-orange-500/5 blur-3xl rounded-full" />
                          
                          <div className="relative z-10 flex flex-col gap-24">
                            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-12 items-center">
                              {/* Text on Left */}
                              <div className="space-y-6 order-2 md:order-1">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-500 text-[10px] font-mono tracking-widest uppercase">
                                  Showcase Video 2
                                </div>
                                <h3 className="text-3xl md:text-5xl font-display font-medium text-white leading-tight">
                                  The Revision <br /> Semarak Media Trailer
                                </h3>
                                <p className="text-zinc-400 leading-relaxed max-w-2xl font-light text-lg">
                                  A dramatic sequence portraying the endless cycle of design revisions, featuring tension-inducing sound design, fast cuts, and a suspenseful trailer vibe for a relatable, comedic effect.
                                </p>
                              </div>
                              
                              {/* Video on Right */}
                              <div className="relative group/video overflow-hidden rounded-[2.5rem] bg-black border border-white/10 aspect-[9/16] w-full max-w-[280px] mx-auto md:mx-0 order-1 md:order-2">
                                  <video
                                    className="w-full h-full object-cover opacity-60 transition-opacity duration-300 group-hover/video:opacity-100"
                                    playsInline
                                    preload="metadata"
                                  >
                                    <source src="/Semarak-Trailer-2.mp4#t=0.1" type="video/mp4" />
                                  </video>
                                  <div
                                    className="absolute inset-0 z-20 flex items-center justify-center bg-black/20 group-hover/video:bg-black/40 transition-colors cursor-pointer"
                                    onClick={() => setCinemaModeVideo("/Semarak-Trailer-2.mp4")}
                                  >
                                    <motion.div
                                      whileHover={{ scale: 1.1 }}
                                      whileTap={{ scale: 0.9 }}
                                      className="w-16 h-16 rounded-full bg-orange-500 text-black flex items-center justify-center shadow-[0_0_40px_rgba(249,115,22,0.6)]"
                                    >
                                      <Play className="w-6 h-6 fill-current translate-x-1" />
                                    </motion.div>
                                  </div>
                              </div>
                            </div>
                            
                            {/* Technical Deep Dive */}
                            <div className="space-y-12">
                               <div className="flex flex-col gap-4">
                                 <div className="inline-flex self-start items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-500 text-[10px] font-mono tracking-widest uppercase">
                                   Deep Dive
                                 </div>
                                 <h3 className="text-3xl font-display font-medium text-white">
                                   Editing Technique Breakdown
                                 </h3>
                               </div>

                             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                               {/* Breakdown list */}
                               <div className="space-y-6">
                                 <h4 className="text-lg font-bold text-white tracking-widest uppercase font-display border-b border-white/10 pb-4">
                                   Visual & Transitions
                                 </h4>
                                 <ul className="space-y-4">
                                   <li className="flex gap-4">
                                     <div className="p-2 rounded-lg bg-orange-500/10 h-fit">
                                       <Video className="w-4 h-4 text-orange-500" />
                                     </div>
                                     <div>
                                        <p className="text-sm font-bold text-white mb-1 uppercase tracking-wider">Fast-Paced Action</p>
                                        <p className="text-xs text-zinc-500 leading-relaxed font-light">Transisi cepat yang mengikuti beat narasi suspense, memberikan efek ketegangan layaknya menonton film thriller, merepresentasikan rasa frustrasi menghadapi revisi tiada akhir.</p>
                                     </div>
                                   </li>
                                   <li className="flex gap-4">
                                     <div className="p-2 rounded-lg bg-emerald-500/10 h-fit">
                                       <Camera className="w-4 h-4 text-emerald-500" />
                                     </div>
                                     <div>
                                        <p className="text-sm font-bold text-white mb-1 uppercase tracking-wider">Angle & Storyboard</p>
                                        <p className="text-xs text-zinc-500 leading-relaxed font-light">Pengambilan gambar yang dramatis, dengan fokus pada ekspresi kelelahan tim. Alur memuncak pada punchline bahwa revisi hanyalah reinkarnasi dengan nama baru.</p>
                                     </div>
                                   </li>
                                   <li className="flex gap-4">
                                     <div className="p-2 rounded-lg bg-blue-500/10 h-fit">
                                       <Palette className="w-4 h-4 text-blue-500" />
                                     </div>
                                     <div>
                                        <p className="text-sm font-bold text-white mb-1 uppercase tracking-wider">Color Grading & Lighting</p>
                                        <p className="text-xs text-zinc-500 leading-relaxed font-light">Tone warna gelap dan sinematik yang memberikan kesan suram dan misterius, seperti sedang mengungkap konspirasi file berakhiran '_final_v2'.</p>
                                     </div>
                                   </li>
                                   <li className="flex gap-4">
                                     <div className="p-2 rounded-lg bg-purple-500/10 h-fit">
                                       <Sparkles className="w-4 h-4 text-purple-500" />
                                     </div>
                                     <div>
                                        <p className="text-sm font-bold text-white mb-1 uppercase tracking-wider">Effects & SFX</p>
                                        <p className="text-xs text-zinc-500 leading-relaxed font-light">Penggunaan sound effect khas trailer blockbuster (bass drops, risers, dan swooshes), dipadukan dengan tipografi judul besar yang terkesan epik.</p>
                                     </div>
                                   </li>
                                 </ul>
                               </div>

                               {/* Concept & Narrative Strategy */}
                               <div className="space-y-8">
                                 <div className="p-6 rounded-2xl bg-black border border-white/5 space-y-4">
                                   <div className="flex items-center gap-3 mb-2">
                                     <MessageSquare className="w-5 h-5 text-zinc-300" />
                                     <h4 className="text-sm font-bold text-white uppercase tracking-widest">Concept & Narrative</h4>
                                   </div>
                                    <div className="p-4 rounded-xl bg-orange-500/5 border border-orange-500/20">
                                      <p className="text-[11px] text-orange-200 leading-relaxed italic">
                                        "Di dunia di mana setiap revisi melahirkan revisi baru. Satu tim berjuang melawan file final yang tak pernah final. Mereka pikir ini proyek biasa, tapi mereka salah. This summer, prepare yourself for... THE REVISION. Karena di dunia desain, revisi nggak pernah mati. Dia cuma reinkarnasi dengan nama baru."
                                      </p>
                                    </div>
                                 </div>
                                 
                                 <div className="p-6 rounded-2xl bg-black border border-white/5 space-y-4">
                                   <div className="flex items-center gap-3 mb-2">
                                     <Brain className="w-5 h-5 text-zinc-300" />
                                     <h4 className="text-sm font-bold text-white uppercase tracking-widest">Narration Strategy</h4>
                                   </div>
                                    <p className="text-xs text-zinc-500 leading-relaxed">
                                      Menggunakan gaya Voice of God dari trailer film musim panas Hollywood yang bombastis, diaplikasikan pada penderitaan sehari-hari seorang editor atau desainer: revisi. Hiperbola sinematik ini menjadi senjata komedi utamanya.
                                    </p>
                                 </div>
                                 
                                 <div className="p-6 rounded-2xl bg-black border border-white/5 space-y-4">
                                   <div className="flex items-center gap-3 mb-2">
                                     <Layers className="w-5 h-5 text-zinc-300" />
                                     <h4 className="text-sm font-bold text-white uppercase tracking-widest">Tools</h4>
                                   </div>
                                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                                     <div className="p-4 rounded-xl bg-zinc-900 border border-white/5 flex gap-3 hover:border-[#312563]/50 transition-colors w-full overflow-hidden">
                                        <div className="w-10 h-10 bg-[#312563] text-white flex items-center justify-center font-bold text-lg rounded-lg shrink-0">Pr</div>
                                        <span className="text-[10px] uppercase tracking-widest font-bold text-zinc-400 self-center truncate">Premiere Pro</span>
                                     </div>
                                     <div className="p-4 rounded-xl bg-zinc-900 border border-white/5 flex gap-3 hover:border-white/50 transition-colors w-full overflow-hidden">
                                        <div className="w-10 h-10 bg-white text-black flex items-center justify-center font-bold text-lg rounded-lg shrink-0">C</div>
                                        <span className="text-[10px] uppercase tracking-widest font-bold text-zinc-400 self-center truncate">Capcut Desktop</span>
                                     </div>
                                   </div>
                                 </div>
                               </div>
                             </div>
                           </div>
                          </div>
                        </div>
                      </section>

                      {/* Video Player Display 3 */}
                      <section className="space-y-12 pb-12">
                        <div className="p-8 md:p-12 rounded-[2.5rem] bg-zinc-900/30 border border-white/5 relative overflow-hidden group">
                          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 blur-3xl rounded-full" />
                          
                          <div className="relative z-10 flex flex-col gap-24">
                            <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-12 items-center">
                              {/* Video on Left */}
                              <div className="relative group/video overflow-hidden rounded-[2.5rem] bg-black border border-white/10 aspect-[9/16] w-full max-w-[280px] mx-auto md:mx-0">
                                  <video
                                    className="w-full h-full object-cover opacity-60 transition-opacity duration-300 group-hover/video:opacity-100"
                                    playsInline
                                    preload="metadata"
                                  >
                                    <source src="/Semarak-Bedahh.mp4#t=0.1" type="video/mp4" />
                                  </video>
                                  <div
                                    className="absolute inset-0 z-20 flex items-center justify-center bg-black/20 group-hover/video:bg-black/40 transition-colors cursor-pointer"
                                    onClick={() => setCinemaModeVideo("/Semarak-Bedahh.mp4")}
                                  >
                                    <motion.div
                                      whileHover={{ scale: 1.1 }}
                                      whileTap={{ scale: 0.9 }}
                                      className="w-16 h-16 rounded-full bg-orange-500 text-black flex items-center justify-center shadow-[0_0_40px_rgba(249,115,22,0.6)]"
                                    >
                                      <Play className="w-6 h-6 fill-current translate-x-1" />
                                    </motion.div>
                                  </div>
                              </div>
                              
                              {/* Text on Right */}
                              <div className="space-y-6">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-500 text-[10px] font-mono tracking-widest uppercase">
                                  Showcase Video 3
                                </div>
                                <h3 className="text-3xl md:text-5xl font-display font-medium text-white leading-tight">
                                  Scent Marketing <br /> Brand Breakdown
                                </h3>
                                <p className="text-zinc-400 leading-relaxed max-w-2xl font-light text-lg">
                                  An insightful breakdown of multi-sensory marketing, explaining how brands like bakeries and 5-star hotels use signature scents to subconsciously influence consumer behavior, mood, and purchasing decisions.
                                </p>
                              </div>
                            </div>
                            
                            {/* Technical Deep Dive */}
                            <div className="space-y-12">
                               <div className="flex flex-col gap-4">
                                 <div className="inline-flex self-start items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-500 text-[10px] font-mono tracking-widest uppercase">
                                   Deep Dive
                                 </div>
                                 <h3 className="text-3xl font-display font-medium text-white">
                                   Editing Technique Breakdown
                                 </h3>
                               </div>

                             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                               {/* Breakdown list */}
                               <div className="space-y-6">
                                 <h4 className="text-lg font-bold text-white tracking-widest uppercase font-display border-b border-white/10 pb-4">
                                   Visual & Transitions
                                 </h4>
                                 <ul className="space-y-4">
                                   <li className="flex gap-4">
                                     <div className="p-2 rounded-lg bg-orange-500/10 h-fit">
                                       <Video className="w-4 h-4 text-orange-500" />
                                     </div>
                                     <div>
                                        <p className="text-sm font-bold text-white mb-1 uppercase tracking-wider">Dynamic Pacing</p>
                                        <p className="text-xs text-zinc-500 leading-relaxed font-light">Ritme visual yang menyesuaikan dengan gaya bicara "storytelling", dilengkapi dengan pop-up teks penekanan (keywords) untuk mempertahankan retensi audiens.</p>
                                     </div>
                                   </li>
                                   <li className="flex gap-4">
                                     <div className="p-2 rounded-lg bg-emerald-500/10 h-fit">
                                       <Camera className="w-4 h-4 text-emerald-500" />
                                     </div>
                                     <div>
                                        <p className="text-sm font-bold text-white mb-1 uppercase tracking-wider">B-Roll Integration</p>
                                        <p className="text-xs text-zinc-500 leading-relaxed font-light">Penggunaan stok footage b-roll yang relevan (misalnya roti segar, lobi hotel mewah) untuk mengilustrasikan poin-poin yang sedang dibicarakan secara visual.</p>
                                     </div>
                                   </li>
                                   <li className="flex gap-4">
                                     <div className="p-2 rounded-lg bg-blue-500/10 h-fit">
                                       <Palette className="w-4 h-4 text-blue-500" />
                                     </div>
                                     <div>
                                        <p className="text-sm font-bold text-white mb-1 uppercase tracking-wider">Color & Tone</p>
                                        <p className="text-xs text-zinc-500 leading-relaxed font-light">Pengaturan tone warna yang mengundang (warm) saat membahas roti, dan tone yang lebih elegan (premium) saat membahas hotel bintang 5.</p>
                                     </div>
                                   </li>
                                   <li className="flex gap-4">
                                     <div className="p-2 rounded-lg bg-purple-500/10 h-fit">
                                       <Sparkles className="w-4 h-4 text-purple-500" />
                                     </div>
                                     <div>
                                        <p className="text-sm font-bold text-white mb-1 uppercase tracking-wider">Audio & SFX</p>
                                        <p className="text-xs text-zinc-500 leading-relaxed font-light">Pemakaian sound design yang presisi—seperti suasana kafe atau white noise hotel yang halus—dipadukan dengan voiceover yang sangat clear dan jernih.</p>
                                     </div>
                                   </li>
                                 </ul>
                               </div>

                               {/* Concept & Narrative Strategy */}
                               <div className="space-y-8">
                                 <div className="p-6 rounded-2xl bg-black border border-white/5 space-y-4">
                                   <div className="flex items-center gap-3 mb-2">
                                     <MessageSquare className="w-5 h-5 text-zinc-300" />
                                     <h4 className="text-sm font-bold text-white uppercase tracking-widest">Concept & Narrative</h4>
                                   </div>
                                    <div className="p-4 rounded-xl bg-orange-500/5 border border-orange-500/20">
                                      <p className="text-[11px] text-orange-200 leading-relaxed italic">
                                        "Pernah nggak sih kamu lewat depan toko roti, belum lapar, eh ujung-ujungnya beli juga? Itu bukan suatu kebetulan, itu aroma yang sengaja dibuat. Roti O, itu contoh yang paling gampang. Aromanya sengaja disebar keluar toko biar kamu kebawa masuk. Kalau Hotel Bintang 5, sama juga. Setiap hotel itu ngasih signature scent..."
                                      </p>
                                    </div>
                                 </div>
                                 
                                 <div className="p-6 rounded-2xl bg-black border border-white/5 space-y-4">
                                   <div className="flex items-center gap-3 mb-2">
                                     <Brain className="w-5 h-5 text-zinc-300" />
                                     <h4 className="text-sm font-bold text-white uppercase tracking-widest">Narration Strategy</h4>
                                   </div>
                                    <p className="text-xs text-zinc-500 leading-relaxed">
                                      Pendekatan storytelling yang edukasional namun sangat conversational. Menyampaikan "marketing insight" berat (multi-sensory marketing) lewat observasi pengalaman sehari-hari yang sangat relatable, mempertahankan rasa "aha!" bagi penonton.
                                    </p>
                                 </div>
                                 
                                 <div className="p-6 rounded-2xl bg-black border border-white/5 space-y-4">
                                   <div className="flex items-center gap-3 mb-2">
                                     <Layers className="w-5 h-5 text-zinc-300" />
                                     <h4 className="text-sm font-bold text-white uppercase tracking-widest">Tools</h4>
                                   </div>
                                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                                     <div className="p-4 rounded-xl bg-zinc-900 border border-white/5 flex gap-3 hover:border-[#312563]/50 transition-colors w-full overflow-hidden">
                                        <div className="w-10 h-10 bg-[#312563] text-white flex items-center justify-center font-bold text-lg rounded-lg shrink-0">Pr</div>
                                        <span className="text-[10px] uppercase tracking-widest font-bold text-zinc-400 self-center truncate">Premiere Pro</span>
                                     </div>
                                     <div className="p-4 rounded-xl bg-zinc-900 border border-white/5 flex gap-3 hover:border-white/50 transition-colors w-full overflow-hidden">
                                        <div className="w-10 h-10 bg-white text-black flex items-center justify-center font-bold text-lg rounded-lg shrink-0">C</div>
                                        <span className="text-[10px] uppercase tracking-widest font-bold text-zinc-400 self-center truncate">Capcut Desktop</span>
                                     </div>
                                   </div>
                                 </div>
                               </div>
                             </div>
                           </div>
                          </div>
                        </div>
                      </section>

                      {/* Fast Track / Quick View */}
                      <section className="space-y-12 pb-12 pt-12 border-t border-white/5">
                          <div className="flex flex-col items-center text-center gap-4 max-w-2xl mx-auto">
                              <h3 className="text-3xl font-display font-medium text-white">Fast Track Gallery</h3>
                              <p className="text-zinc-400 font-light text-lg">
                                  For a swift overview, here is a curated selection of my other video editing works. Let's get straight to the point.
                              </p>
                          </div>
                          
                          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                              {[
                                  "/Cozyon-Cinematicc.mp4",
                                  "/Semarak-Duell.mp4",
                                  "/Tailg-Evv.mp4",
                                  "/Semarak-Trailer-3.mp4"
                              ].map((src, i) => (
                                  <div key={i} className="relative group/video overflow-hidden rounded-[2.5rem] bg-black border border-white/10 aspect-[9/16] w-full">
                                      <video
                                        className="w-full h-full object-cover opacity-60 transition-opacity duration-300 group-hover/video:opacity-100"
                                        playsInline
                                        preload="metadata"
                                      >
                                          <source src={`${src}#t=0.1`} type="video/mp4" />
                                      </video>
                                      <div
                                        className="absolute inset-0 z-20 flex items-center justify-center bg-black/20 group-hover/video:bg-black/40 transition-colors cursor-pointer"
                                        onClick={() => setCinemaModeVideo(src)}
                                      >
                                          <motion.div
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            className="w-16 h-16 rounded-full bg-orange-500 text-black flex items-center justify-center shadow-[0_0_40px_rgba(249,115,22,0.6)]"
                                          >
                                              <Play className="w-6 h-6 fill-current translate-x-1" />
                                          </motion.div>
                                      </div>
                                  </div>
                              ))}
                          </div>
                      </section>
                    </div>
                  ) : (
                    /* Individual Projects Grid for other categories */
                    <div className="grid grid-cols-1 gap-12 pt-12 min-h-[400px] flex items-center justify-center text-center">
                      <div className="space-y-6 grayscale opacity-40">
                        <Layers className="w-16 h-16 mx-auto text-zinc-700" />
                        <p className="text-zinc-600 font-mono text-sm tracking-widest">
                          PROJECT GALLERY COMING SOON
                        </p>
                        <button
                          onClick={() => setView("portfolio-hub")}
                          className="text-xs uppercase tracking-widest font-bold text-orange-500/80 hover:text-orange-500 transition-colors"
                        >
                          EXPLORE OTHER PATHS
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <section className="mt-24 max-w-5xl mx-auto">
                    <div className="p-8 md:p-12 rounded-[2.5rem] bg-zinc-900/40 border border-white/5 relative overflow-hidden">
                        <div className="absolute -top-32 -right-32 w-96 h-96 bg-orange-500/10 blur-3xl rounded-full" />
                        
                        <div className="relative z-10 space-y-12">
                            <div className="flex flex-col gap-4">
                                <div className="inline-flex self-start items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-500 text-[10px] font-mono tracking-widest uppercase">
                                    Freelance Experience
                                </div>
                                <h3 className="text-3xl font-display font-medium text-white">Pssttt... Client Ratings</h3>
                                <p className="text-zinc-400 leading-relaxed font-light text-lg">
                                   I have also worked as a freelance video editor on Fastwork under the alias <strong>daexhi</strong>. Here are a few testimonials from clients who have hired me, emphasizing speed, quality, and overall satisfaction. You can view my full profile here: <a href="https://fastwork.id/user/daexhi" target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:text-orange-300 underline underline-offset-4 transition-colors">fastwork.id/user/daexhi</a>.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {[
                                    { text: "Kerjanya cepet banget, komunikatif, dan hasilnya juga bagus banget... Sangat memuaskan!!", user: "Client Fastwork" },
                                    { text: "Kerja cepat, revisi juga cepat. Hasil akhir video sangat memuaskan dan profesional.", user: "Client Fastwork" },
                                    { text: "Sangat komunikatif dan mengerti arahan dengan baik. Video selesai lebih cepat dari deadline dengan kualitas yang bagus.", user: "Client Fastwork" },
                                    { text: "Editor fast respon, kerja bagus & cepat. Next bakal order lagi.", user: "Client Fastwork" },
                                ].map((review, i) => (
                                    <div key={i} className="p-6 rounded-2xl bg-black border border-white/5 space-y-4">
                                        <div className="flex text-orange-500 gap-1 pb-1">
                                            {[1,2,3,4,5].map(star => <Star key={star} className="w-4 h-4 fill-current" />)}
                                        </div>
                                        <p className="text-zinc-300 font-medium italic text-sm leading-relaxed">"{review.text}"</p>
                                        <p className="text-zinc-500 text-xs font-mono uppercase tracking-widest">— {review.user}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                <motion.div 
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  className="mt-24 pt-12 border-t border-white/5 flex flex-col items-center gap-6"
                >
                  <p className="text-zinc-500 text-sm font-mono uppercase tracking-[0.3em]">End of Portfolio</p>
                  <button
                    onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                    className="flex items-center gap-2 px-8 py-3 rounded-full bg-zinc-900 border border-white/10 text-white hover:bg-orange-500 hover:border-orange-500 transition-all group shadow-xl"
                  >
                    <ChevronLeft className="w-4 h-4 rotate-90 group-hover:-translate-y-1 transition-transform" />
                    Back to Top
                  </button>
                </motion.div>
              </motion.main>
            )
          )}
        </AnimatePresence>
      </div>

      {/* Decorative Elements */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-orange-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[100px]" />
      </div>

      {/* Project Detail Modal */}
      <AnimatePresence>
        {selectedProject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProject(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div
              layoutId={`project-${selectedProject.id}`}
              className="relative w-full max-w-3xl max-h-[90vh] bg-[#0F0F0F] border border-white/10 rounded-3xl overflow-y-auto shadow-2xl scrollbar-hide"
            >
              <button
                onClick={() => setSelectedProject(null)}
                className="absolute top-6 right-6 z-10 p-2 bg-black/40 hover:bg-white/10 rounded-full text-white/70 hover:text-white transition-colors border border-white/5 backdrop-blur-sm"
              >
                <X className="w-5 h-5" />
              </button>

              <div
                className={`h-48 md:h-64 bg-gradient-to-br ${selectedProject.color} opacity-40 relative flex items-center justify-center`}
              >
                <selectedProject.icon className="w-20 h-20 text-white/90 drop-shadow-lg" />
              </div>

              <div className="p-8 md:p-12 space-y-8">
                <div className="space-y-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono text-orange-500 uppercase tracking-widest">
                        {selectedProject.category}
                      </span>
                      <span className="h-px w-8 bg-orange-500/30"></span>
                      <span className="text-xs font-mono text-zinc-500 uppercase tracking-widest">
                        {selectedProject.company}
                      </span>
                    </div>
                    <h2 className="text-3xl md:text-5xl font-display font-bold text-white leading-tight">
                      {selectedProject.title}
                    </h2>
                  </div>
                  <p className="text-lg text-zinc-400 font-light leading-relaxed max-w-2xl">
                    {selectedProject.longDescription}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-8 border-t border-white/5">
                  <div className="space-y-6">
                    <h4 className="text-xs font-mono uppercase tracking-widest text-zinc-500">
                      Key Responsibilities
                    </h4>
                    <ul className="space-y-4">
                      {selectedProject.tasks.map((task, i) => (
                        <li key={i} className="flex gap-4 text-zinc-300">
                          <span className="flex-shrink-0 w-5 h-5 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-mono text-orange-500">
                            0{i + 1}
                          </span>
                          <span className="text-sm leading-relaxed">
                            {task}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-6">
                    <h4 className="text-xs font-mono uppercase tracking-widest text-zinc-500">
                      Project Context
                    </h4>
                    <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4">
                      <div className="flex items-center gap-3 text-zinc-400">
                        <Award className="w-4 h-4 text-orange-500" />
                        <span className="text-sm">Verified Experience</span>
                      </div>
                      <div className="flex items-center gap-3 text-zinc-400">
                        <Layers className="w-4 h-4 text-orange-500" />
                        <span className="text-sm">Professional Industry</span>
                      </div>
                      <button className="w-full mt-4 py-3 bg-white text-black font-bold rounded-xl hover:bg-orange-500 hover:text-white transition-all transform active:scale-95 text-sm">
                        Contact regarding this role
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Contact Modal */}
      <AnimatePresence>
        {isContactOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsContactOpen(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-xl"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg bg-[#0F0F0F] border border-white/10 rounded-3xl overflow-hidden shadow-2xl p-8 md:p-12 space-y-8"
            >
              <button
                onClick={() => setIsContactOpen(false)}
                className="absolute top-6 right-6 p-2 text-zinc-500 hover:text-white transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-2">
                <h2 className="text-3xl font-display font-bold text-white">
                  Let's Connect
                </h2>
                <p className="text-zinc-500 font-mono text-[10px] uppercase tracking-widest leading-none">
                  Available for new opportunities
                </p>
              </div>

              <div className="space-y-4">
                <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between group hover:border-orange-500/30 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                      <Mail className="w-5 h-5 text-orange-500" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-mono text-zinc-500 mb-0.5">
                        Email
                      </p>
                      <p className="text-sm text-zinc-200 font-medium tracking-tight">
                        aliff.akbarr@gmail.com
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      handleCopy("aliff.akbarr@gmail.com", "email")
                    }
                    className="p-2 text-zinc-600 hover:text-white transition-colors"
                    title="Copy email"
                  >
                    {copiedType === "email" ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>

                <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between group hover:border-orange-500/30 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                      <Phone className="w-5 h-5 text-orange-500" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-mono text-zinc-500 mb-0.5">
                        WhatsApp
                      </p>
                      <p className="text-sm text-zinc-200 font-medium tracking-tight">
                        +62 851-6705-4267
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <a
                      href="https://wa.me/6285167054267"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-zinc-600 hover:text-white transition-colors"
                      title="Chat on WhatsApp"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                    <button
                      onClick={() => handleCopy("+6285167054267", "phone")}
                      className="p-2 text-zinc-600 hover:text-white transition-colors"
                      title="Copy phone"
                    >
                      {copiedType === "phone" ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between group hover:border-orange-500/30 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                      <Linkedin className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-mono text-zinc-500 mb-0.5">
                        LinkedIn
                      </p>
                      <p className="text-sm text-zinc-200 font-medium tracking-tight">
                        linkedin.com/in/aliff-akbarr
                      </p>
                    </div>
                  </div>
                  <a
                    href="https://linkedin.com/in/aliff-akbarr"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-zinc-600 hover:text-white transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3 p-5 rounded-2xl border border-dashed border-white/10 text-zinc-500 bg-black/20">
                <MapPin className="w-4 h-4 text-zinc-700" />
                <p className="text-[11px] leading-relaxed">
                  Based in Tanjung Priok, Jakarta Utara, Indonesia (GMT+7).
                  Always open to remote or local collaborations.
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {cinemaModeVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md p-4 md:p-12"
            onClick={() => {
              setCinemaModeVideo(null);
            }}
          >
            <button
              className="absolute top-8 right-8 text-white hover:text-orange-500 transition-colors z-[60]"
              onClick={() => {
                setCinemaModeVideo(null);
              }}
            >
              <X className="w-8 h-8" />
            </button>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-[400px] aspect-[9/16] rounded-3xl overflow-hidden bg-black shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <video
                ref={(el) => {
                   if (el && cinemaModeVideo) {
                      el.src = cinemaModeVideo;
                      el.play().catch(e => console.log('Autoplay failed', e));
                   }
                }}
                className="w-full h-full object-cover"
                controls
                playsInline
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
