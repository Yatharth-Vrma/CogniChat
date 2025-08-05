import React, { useEffect, useState } from "react";
import { TextReveal } from "./text-reveal";
import { cn } from "../../lib/utils";
import "./SplashText.css";

export default function TextRevealLetters({ onFinish }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      if (onFinish) onFinish();
    }, 3800);
    return () => clearTimeout(timer);
  }, [onFinish]);

  if (!visible) return null;

  return (
    <div className="splash-text-container">
      <TextReveal
        className={cn(
          "bg-primary from-foreground via-gray-200 bg-clip-text text-6xl font-bold text-transparent dark:bg-gradient-to-b"
        )}
        from="bottom"
        split="letter"
      >
        Welcome to CogniChat !
      </TextReveal>
    </div>
  );
}