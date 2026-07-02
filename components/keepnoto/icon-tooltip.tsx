"use client";

import * as React from "react";

import { Tooltip, type TooltipSide } from "@/components/keepnoto/tooltip";

export type IconTooltipSide = TooltipSide;

export type IconTooltipProps = {
  label: string;
  side: IconTooltipSide;
  delay?: number;
  children: React.ReactElement<Record<string, unknown>>;
};

export function IconTooltip(props: IconTooltipProps) {
  return <Tooltip {...props} />;
}