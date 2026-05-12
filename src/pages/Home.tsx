/**
 * Home Page - ToolPix Landing
 * Design: Gradient Mesh Minimal
 * - Hero section with gradient mesh background
 * - Tool cards grid with category-specific gradients
 * - SEO-friendly content sections
 */
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Maximize2, Minimize2, RefreshCw, Crop, Shield, Zap, Globe } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import AdSlot from "@/components/AdSlot";

const tools = [
  {
    href: "/resize",
    title: "Image Resize",
    description: "Resize images to any dimension. Perfect for social media, web, and print.",
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663647949776/NnAk5PzaE2Nv2C9iuzpULH/tool-resize-card-RhnAA5mjinHQ4jJD7JSn2A.webp",
    gradient: "from-[#FF6B6B] to-[#FEC89A]",
    icon: Maximize2,
  },
  {
    href: "/compress",
    title: "Image Compress",
    description: "Reduce file size without losing quality. Speed up your website loading.",
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663647949776/NnAk5PzaE2Nv2C9iuzpULH/tool-compress-card-aLFL6b4Pgdb7nKAeZYK3Fk.webp",
    gradient: "from-[#6EDCD9] to-[#38BDF8]",
    icon: Minimize2,
  },
  {
    href: "/convert",
    title: "Format Convert",
    description: "Convert between PNG, JPG, and WebP formats instantly.",
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663647949776/NnAk5PzaE2Nv2C9iuzpULH/tool-convert-card-5TUprxt8DTmqMVVpr7MQi2.webp",
    gradient: "from-[#A78BFA] to-[#6366F1]",
    icon: RefreshCw,
  },
  {
    href: "/crop",
    title: "Image Crop",
    description: "Crop images with precision. Custom aspect ratios and free-form selection.",
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663647949776/NnAk5PzaE2Nv2C9iuzpULH/tool-crop-card-4tBCksd5XnXGkkv2UwAy48.webp",
    gradient: "from-[#BEF264] to-[#10B981]",
    icon: Crop,
  },
];

const features = [
  {
    icon: Shield,
    title: "100% Private",
    description: "All processing happens in your browser. Your files never leave your device.",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "No upload or download wait times. Instant results powered by your browser.",
  },
  {
    icon: Globe,
    title: "Free Forever",
    description: "No sign-up, no limits, no watermarks. Professional tools for everyone.",
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function Home() {
  return (
    <div>
      <SEOHead
        title="ToolPix - Free Online Image Tools | Resize, Compress, Convert, Crop"
        description="Free online image tools - resize, compress, convert, crop images instantly in your browser. No upload needed, 100% private and fast."
        path="/"
      />

      {/* Hero Section */}
      <section className="relative isolate overflow-hidden py-20 md:py-32">
        {/* Background gradient mesh */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <img
            src="https://d2xsxph8kpxj0f.cloudfront.net/310519663647949776/NnAk5PzaE2Nv2C9iuzpULH/hero-gradient-mesh-jkGRcbXsB393s7gVyPbtUb.webp"
            alt=""
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/30 to-background" />
        </div>

        <div className="container relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-3xl"
          >
            <h1 className="font-display font-bold text-4xl md:text-6xl lg:text-7xl tracking-tight text-foreground leading-[1.1] mb-6">
              Free Image Tools,{" "}
              <span className="bg-gradient-to-r from-[#A78BFA] to-[#6366F1] bg-clip-text text-transparent">
                Right in Your Browser
              </span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mb-8">
              Resize, compress, convert, and crop images instantly. No uploads, no sign-ups, 
              no watermarks. Your files stay private on your device.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/resize"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-foreground text-background font-medium text-sm hover:opacity-90 transition-opacity"
              >
                <Maximize2 className="w-4 h-4" />
                Start Resizing
              </Link>
              <Link
                href="/compress"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-border bg-card font-medium text-sm hover:bg-muted transition-colors"
              >
                <Minimize2 className="w-4 h-4" />
                Compress Image
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Tools Grid */}
      <section className="py-16 md:py-24">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-12"
          >
            <h2 className="font-display font-bold text-3xl md:text-4xl tracking-tight mb-3">
              All the Tools You Need
            </h2>
            <p className="text-muted-foreground text-lg">
              Professional image editing tools, completely free and private.
            </p>
          </motion.div>

          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {tools.map((tool) => (
              <motion.div key={tool.href} variants={item}>
                <Link href={tool.href} className="block">
                  <div className="tool-card group h-full">
                    {/* Gradient accent bar */}
                    <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${tool.gradient} rounded-t-xl`} />
                    
                    <div className="flex flex-col sm:flex-row gap-5 items-start">
                      <div className="w-full sm:w-40 h-32 sm:h-28 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                        <img
                          src={tool.image}
                          alt={tool.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <tool.icon className="w-4 h-4 text-muted-foreground" />
                          <h3 className="font-display font-semibold text-lg">{tool.title}</h3>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {tool.description}
                        </p>
                        <span className="inline-block mt-3 text-sm font-medium text-primary group-hover:underline">
                          Use tool &rarr;
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="font-display font-bold text-3xl md:text-4xl tracking-tight mb-3">
              Why Choose ToolPix?
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Built for speed, privacy, and simplicity.
            </p>
          </motion.div>

          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {features.map((feature) => (
              <motion.div
                key={feature.title}
                variants={item}
                className="text-center p-6"
              >
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Ad Slot */}
      <div className="container py-4">
        <AdSlot format="horizontal" />
      </div>

      {/* SEO Content Section */}
      <section className="py-16 md:py-24">
        <div className="container max-w-3xl">
          <h2 className="font-display font-bold text-2xl md:text-3xl tracking-tight mb-6">
            Free Online Image Editor — No Software Required
          </h2>
          <div className="prose prose-gray max-w-none text-muted-foreground leading-relaxed space-y-4">
            <p>
              ToolPix is a collection of free online image editing tools that work entirely in your web browser. 
              Whether you need to resize an image for social media, compress a photo for your website, 
              convert between image formats, or crop a picture to the perfect dimensions — ToolPix handles it all instantly.
            </p>
            <p>
              Unlike other online image tools, ToolPix processes everything locally on your device using modern browser APIs. 
              This means your images are never uploaded to any server, ensuring complete privacy and security. 
              There are no file size limits imposed by server uploads, and processing is lightning-fast since everything happens on your machine.
            </p>
            <p>
              Our tools support all major image formats including PNG, JPEG, WebP, and GIF. 
              Whether you're a web developer optimizing images for performance, a social media manager preparing content, 
              or anyone who needs quick image editing — ToolPix is the fastest, most private solution available.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
