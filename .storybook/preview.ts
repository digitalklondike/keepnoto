import React from "react";
import type { Decorator, Preview } from "@storybook/nextjs-vite";

import "../app/globals.css";

const withWorkbenchCanvas: Decorator = (Story) =>
  React.createElement(
    "div",
    {
      className: "min-h-screen bg-[var(--workbench-canvas)] text-[var(--content-primary)]",
    },
    React.createElement(Story)
  );

const preview: Preview = {
  decorators: [withWorkbenchCanvas],
  parameters: {
    backgrounds: {
      options: {
        workbench: { name: "Workbench", value: "var(--workbench-canvas)" },
        surface: { name: "Surface", value: "var(--surface)" },
        white: { name: "White", value: "var(--white)" },
      },
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;