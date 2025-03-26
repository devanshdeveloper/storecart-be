const mongoose = require('mongoose');
const { Notification } = require('../models');

const notificationSeeds = {
  Model: Notification,
  data: [
    {
      user: "67d57ce6d614cff321c2b084",
      title: "Welcome to Storecart",
      description: "Welcome to our education management system. Get started by exploring the dashboard.",
      redirect: "/dashboard",
      read: false,
      icon: "system",
      color: "primary",
      avatar: "/assets/system-avatar.png"
    },
    {
      user: "67d57ce6d614cff321c2b084",
      title: "New Comment on Your Post",
      description: "John Doe commented on your discussion post about Mathematics homework.",
      redirect: "/discussions/post/123",
      read: true,
      icon: "comment",
      color: "success",
      avatar: "/assets/user-avatars/john-doe.png"
    },
    {
      user: "67d57ce6d614cff321c2b084",
      title: "Assignment Due Reminder",
      description: "Your Physics assignment is due tomorrow at 11:59 PM.",
      redirect: "/assignments/physics/hw2",
      read: false,
      icon: "system",
      color: "warning",
      avatar: "/assets/course-avatars/physics.png"
    },
    {
      user: "67d57ce6d614cff321c2b084",
      title: "You were mentioned in a discussion",
      description: "Sarah Smith mentioned you in the Chemistry study group discussion.",
      redirect: "/groups/chemistry/discussions",
      read: false,
      icon: "mention",
      color: "primary",
      avatar: "/assets/user-avatars/sarah-smith.png"
    },
    {
      user: "67d57ce6d614cff321c2b084",
      title: "Your Answer was Liked",
      description: "A teacher liked your answer in the Mathematics Q&A forum.",
      redirect: "/forums/math/qa/456",
      read: true,
      icon: "like",
      color: "success",
      avatar: "/assets/default-avatar.png"
    },
    {
      user: "67d57ce6d614cff321c2b084",
      title: "System Maintenance Notice",
      description: "The system will undergo maintenance on Saturday at 2 AM EST.",
      redirect: "/announcements/system",
      read: false,
      icon: "system",
      color: "danger",
      avatar: "/assets/system-avatar.png"
    }
  ]
};

module.exports = notificationSeeds;