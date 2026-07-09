import type { StorybookConfig } from "@storybook/nextjs-vite";

const config: StorybookConfig = {
  stories: ["./stories/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  addons: ["@storybook/addon-docs"],
  framework: {
    name: "@storybook/nextjs-vite",
    options: {},
  },
  staticDirs: ["../public"],
  async viteFinal(config) {
    const { mergeConfig } = await import("vite");

    return mergeConfig(config, {
      build: {
        chunkSizeWarningLimit: 800,
        rollupOptions: {
          output: {
            manualChunks(id) {
              const normalizedId = id.replaceAll("\\", "/");

              if (!normalizedId.includes("node_modules")) {
                return undefined;
              }

              if (normalizedId.includes("/react-dom/")) {
                return "vendor-react-dom";
              }

              if (normalizedId.includes("/react/")) {
                return "vendor-react";
              }

              const storybookPackage = normalizedId.match(/\/node_modules\/@storybook\/([^/]+)/)?.[1];

              if (storybookPackage) {
                return `vendor-storybook-${storybookPackage.replace(/[^a-z0-9_-]/gi, "-")}`;
              }

              if (normalizedId.includes("/@base-ui/")) {
                return "vendor-base-ui";
              }

              if (normalizedId.includes("/@hugeicons/")) {
                return "vendor-icons";
              }

              if (normalizedId.includes("/@emotion/")) {
                return "vendor-emotion";
              }

              if (normalizedId.includes("/@mdx-js/") || normalizedId.includes("/micromark") || normalizedId.includes("/remark-")) {
                return "vendor-mdx";
              }

              const packagePath = normalizedId.split("/node_modules/").pop() ?? "vendor";
              const [firstSegment, secondSegment] = packagePath.split("/");

              if (firstSegment === "storybook") {
                const storybookDistPath = packagePath.match(/^storybook\/dist\/([^/]+)\/(.+)$/);
                const storybookSection = storybookDistPath?.[1] ?? "core";
                const storybookFile = storybookDistPath?.[2]?.split("/").pop()?.replace(/\.[cm]?js$/, "");

                if (storybookSection === "_browser-chunks" && storybookFile) {
                  return `vendor-storybook-${storybookSection}-${storybookFile.replace(/[^a-z0-9_-]/gi, "-")}`;
                }

                return `vendor-storybook-${storybookSection.replace(/[^a-z0-9_-]/gi, "-")}`;
              }

              const packageName = firstSegment?.startsWith("@") ? `${firstSegment}-${secondSegment}` : firstSegment;

              return `vendor-${(packageName ?? "misc").replace(/[^a-z0-9_-]/gi, "-")}`;
            },
          },
        },
      },
    });
  },
};

export default config;