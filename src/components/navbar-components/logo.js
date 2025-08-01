import React from "react";

const Logo = () => {
  return (
    <div className="flex items-center gap-2">
      <div className="h-8 w-8 rounded bg-primary flex items-center justify-center">
        <span className="text-primary-foreground font-bold text-sm">M</span>
      </div>
      <span className="font-semibold text-foreground">Mvpblocks</span>
    </div>
  );
};

export default Logo;
