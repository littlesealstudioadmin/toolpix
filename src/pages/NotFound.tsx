import { Link } from "wouter";
import { motion } from "framer-motion";
import { Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="font-display font-bold text-6xl md:text-8xl bg-gradient-to-r from-[#A78BFA] to-[#6366F1] bg-clip-text text-transparent mb-4">
          404
        </h1>
        <p className="text-lg text-muted-foreground mb-8">
          This page doesn't exist. Let's get you back on track.
        </p>
        <Link href="/">
          <Button className="gap-2">
            <Home className="w-4 h-4" />
            Back to Home
          </Button>
        </Link>
      </motion.div>
    </div>
  );
}
