import React from "react";
import { Button } from "../ui/button";

const NotificationMenu = () => {
  const hasNotifications = true;

  return (
    <Button variant="ghost" size="icon" className="relative">
      <svg
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
        <path d="m13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
      {hasNotifications && (
        <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
      )}
      <span className="sr-only">Notifications</span>
    </Button>
  );
};

export default NotificationMenu;
