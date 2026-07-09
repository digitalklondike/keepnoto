/* eslint-disable @next/next/no-img-element */
import * as React from "react";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import { Button as BaseButton } from "@/components/ui/button";
import {
  COMPACT_PREVIEW_MAX_ASPECT_RATIO,
  COMPACT_PREVIEW_MIN_ASPECT_RATIO,
} from "@/components/keepnoto/design-constants";
import { IconTooltip, type IconTooltipSide } from "@/components/keepnoto/icon-tooltip";
import { Tooltip, useOverflowState } from "@/components/keepnoto/tooltip";
import { BookmarkIcon, Icons } from "@/components/keepnoto/icons";
import { cn } from "@/lib/utils";

export type VisualState = "default" | "hover" | "pressed" | "selected";
export type IconName = IconSvgElement;
export type ButtonTone = "primary" | "secondary" | "secondaryDanger" | "ghost";

const gradientClassName = "bg-[image:var(--gradient-primary)]";

export function Icon({
  icon,
  className,
  size = 24,
  strokeWidth = 2,
}: {
  icon: IconSvgElement;
  className?: string;
  endAdornment?: React.ReactNode;
  size?: number;
  strokeWidth?: number;
}) {
  return (
    <HugeiconsIcon
      icon={icon}
      size={size}
      color="currentColor"
      strokeWidth={strokeWidth}
      className={cn("shrink-0", className)}
      style={{ width: size, height: size, minWidth: size, minHeight: size }}
    />
  );
}

export type ButtonProps = React.ComponentProps<typeof BaseButton> & {
  tone?: ButtonTone;
  visualState?: VisualState;
};

const buttonToneClassName: Record<ButtonTone, string> = {
  primary: cn("text-[var(--white)] hover:brightness-105", gradientClassName),
  secondary: "bg-[var(--control-surface)] text-[var(--content-primary)] hover:bg-[var(--card-control-hover)] data-[state=hover]:bg-[var(--card-control-hover)]",
  secondaryDanger: cn(
    "bg-[var(--control-surface)] text-[var(--danger-muted)] hover:bg-[var(--card-control-hover)] data-[state=hover]:bg-[var(--card-control-hover)]",
    "hover:text-[var(--danger)] data-[state=hover]:text-[var(--danger)]"
  ),
  ghost: "bg-transparent text-[var(--content-primary)] hover:bg-[var(--control-surface)] data-[state=hover]:bg-[var(--control-surface)]",
};

const buttonSelectedClassName: Record<ButtonTone, string> = {
  primary: "data-[state=selected]:text-[var(--white)] data-[state=selected]:shadow-[var(--shadow-active)]",
  secondary: "data-[state=selected]:bg-[var(--cream)] data-[state=selected]:text-[var(--content-primary)] data-[state=selected]:shadow-[var(--shadow-active)]",
  secondaryDanger: "data-[state=selected]:bg-[var(--cream)] data-[state=selected]:text-[var(--danger-muted)] data-[state=selected]:shadow-[var(--shadow-active)]",
  ghost: "data-[state=selected]:bg-[var(--cream)] data-[state=selected]:text-[var(--content-primary)] data-[state=selected]:shadow-[var(--shadow-active)]",
};

export function Button({ tone = "secondary", visualState = "default", className, children, ...props }: ButtonProps) {
  return (
    <BaseButton
      {...props}
      data-state={visualState}
      className={cn(
        "gap-[var(--space-8)] rounded-[var(--radius-round)] border-0 type-16-semibold shadow-none transition-[filter,transform,background-color,opacity] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)]",
        "focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]",
        "data-[state=hover]:brightness-105 data-[state=pressed]:translate-y-px data-[state=pressed]:scale-[0.99]",
        buttonToneClassName[tone],
        buttonSelectedClassName[tone],
        className
      )}
    >
      {children}
    </BaseButton>
  );
}

export type IconButtonSurface = "page" | "card";
export type TooltipSide = IconTooltipSide | "auto";

export type IconButtonMode = "control" | "plain";

const iconButtonControlClassName = cn(
  "relative inline-flex size-[var(--size-48)] items-center justify-center rounded-[var(--radius-round)] p-[var(--space-0)] text-[var(--icon-muted)] transition-[background-color,color,filter,opacity,transform] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)]",
  "focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]",
  "active:scale-[0.96] data-[state=pressed]:scale-[0.96]"
);

const iconButtonPlainClassName = cn(
  "relative inline-flex size-[var(--size-24)] items-center justify-center rounded-[var(--radius-8)] bg-transparent p-[var(--space-0)] text-[var(--icon-muted)] transition-[color,opacity,transform] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)]",
  "focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]",
  "active:scale-[0.96] data-[state=pressed]:scale-[0.96]"
);
const iconButtonToneClassName: Record<ButtonTone, string> = {
  primary: cn(
    "text-[var(--white)]",
    gradientClassName,
    "hover:brightness-105 data-[state=hover]:brightness-105"
  ),
  secondary: cn(
    "text-[var(--icon-muted)]",
    "hover:text-[var(--content-primary)] data-[state=hover]:text-[var(--content-primary)]"
  ),
  secondaryDanger: cn(
    "text-[var(--danger-muted)]",
    "hover:text-[var(--danger)] data-[state=hover]:text-[var(--danger)]"
  ),
  ghost: cn(
    "text-[var(--icon-muted)]",
    "hover:text-[var(--content-primary)] data-[state=hover]:text-[var(--content-primary)]"
  ),
};

function iconButtonSurfaceClassName(surface: IconButtonSurface, tone: ButtonTone) {
  if (tone === "primary") {
    return "";
  }

  if (surface === "card") {
    return "bg-[var(--card-control)] hover:bg-[var(--card-control-hover)] data-[state=hover]:bg-[var(--card-control-hover)]";
  }

  return "bg-transparent hover:bg-transparent data-[state=hover]:bg-transparent";
}

const iconButtonSelectedClassName: Record<ButtonTone, string> = {
  primary: "data-[state=selected]:text-[var(--white)] data-[state=selected]:shadow-[var(--shadow-active)]",
  secondary: "data-[state=selected]:bg-[var(--cream)] data-[state=selected]:text-[var(--content-primary)] data-[state=selected]:shadow-[var(--shadow-active)]",
  secondaryDanger: "data-[state=selected]:bg-[var(--cream)] data-[state=selected]:text-[var(--danger-muted)] data-[state=selected]:shadow-[var(--shadow-active)]",
  ghost: "data-[state=selected]:bg-[var(--cream)] data-[state=selected]:text-[var(--content-primary)] data-[state=selected]:shadow-[var(--shadow-active)]",
};

const iconButtonPlainStateClassName = "bg-transparent text-[var(--icon-muted)] hover:bg-transparent hover:text-[var(--content-primary)] active:bg-transparent data-[state=hover]:bg-transparent data-[state=hover]:text-[var(--content-primary)] data-[state=pressed]:bg-transparent data-[state=pressed]:text-[var(--content-primary)] data-[state=selected]:bg-transparent data-[state=selected]:text-[var(--content-primary)]";

export type IconButtonProps = Omit<ButtonProps, "children"> & {
  icon: IconSvgElement;
  label: string;
  iconSize?: number;
  active?: boolean;
  surface?: IconButtonSurface;
  tooltipSide?: TooltipSide;
  tooltip?: boolean;
  mode?: IconButtonMode;
  href?: string;
  target?: React.HTMLAttributeAnchorTarget;
  rel?: string;
};

export function IconButton({
  icon,
  label,
  iconSize = 20,
  active,
  surface = "page",
  tooltipSide = "right",
  tooltip = true,
  tone = "ghost",
  mode = "control",
  href,
  target,
  rel,
  visualState = "default",
  className,
  ...props
}: IconButtonProps) {
  const state = active ? "selected" : visualState;
  const resolvedTooltipSide: IconTooltipSide = tooltipSide === "auto" ? "left" : tooltipSide;
  const effectiveTone = mode === "plain" ? "ghost" : tone;

  const buttonClassName = cn(
    mode === "plain" ? iconButtonPlainClassName : iconButtonControlClassName,
    mode === "plain" ? iconButtonPlainStateClassName : iconButtonToneClassName[effectiveTone],
    mode === "control" && iconButtonSurfaceClassName(surface, effectiveTone),
    mode === "control" && iconButtonSelectedClassName[effectiveTone],
    props.disabled && "pointer-events-none opacity-45",
    className
  );

  const iconElement = <Icon icon={icon} size={iconSize} strokeWidth={mode === "plain" ? 1.8 : 2} />;

  const button = href ? (
    <a
      aria-label={label}
      data-state={state}
      href={props.disabled ? undefined : href}
      rel={rel}
      target={target}
      className={buttonClassName}
    >
      {iconElement}
    </a>
  ) : mode === "plain" ? (
    <button
      {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}
      aria-label={label}
      aria-pressed={active || undefined}
      data-state={state}
      type={(props as React.ButtonHTMLAttributes<HTMLButtonElement>).type ?? "button"}
      className={buttonClassName}
    >
      {iconElement}
    </button>
  ) : (
    <Button
      {...props}
      aria-label={label}
      aria-pressed={active || undefined}
      visualState={state}
      tone={effectiveTone}
      size="icon-lg"
      className={buttonClassName}
    >
      {iconElement}
    </Button>
  );

  if (!tooltip) {
    return button;
  }

  return (
    <IconTooltip label={label} side={resolvedTooltipSide}>
      {button}
    </IconTooltip>
  );
}
export type TextFieldVisualState = Exclude<VisualState, "selected"> | "focused";

export type TextFieldProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "className"> & {
  icon?: IconSvgElement;
  visualState?: TextFieldVisualState;
  className?: string;
  endAdornment?: React.ReactNode;
  inputClassName?: string;
};

export const TextField = React.forwardRef<HTMLInputElement, TextFieldProps>(function TextField({
  icon = Icons.search,
  visualState = "default",
  className,
  endAdornment,
  inputClassName,
  ...props
}, ref) {
  return (
    <label
      data-state={visualState}
      className={cn(
        "group flex h-[var(--size-48)] w-[var(--search-width)] items-center rounded-[var(--radius-round)] px-[var(--space-16)] text-[var(--content-primary)] backdrop-blur-[var(--blur-soft)] transition-[background-color,opacity,box-shadow] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)]",
        "bg-[var(--panel-surface)] hover:bg-[var(--control-surface)] focus-within:ring-2 focus-within:ring-[var(--focus-ring)] active:bg-[var(--control-surface)]",
        "data-[state=hover]:bg-[var(--control-surface)] data-[state=pressed]:bg-[var(--control-surface)] data-[state=focused]:ring-2 data-[state=focused]:ring-[var(--focus-ring)]",
        props.disabled && "pointer-events-none opacity-45",
        className
      )}
    >
      <span className="flex size-[var(--size-24)] items-center justify-center text-[var(--content-muted)] transition-colors group-hover:text-[var(--content-primary)] group-focus-within:text-[var(--content-primary)] group-data-[state=hover]:text-[var(--content-primary)] group-data-[state=pressed]:text-[var(--content-primary)] group-data-[state=focused]:text-[var(--content-primary)]">
        <Icon icon={icon} size={20} />
      </span>
      <span className="sr-only">Field</span>
      <input
        {...props}
        ref={ref}
        className={cn(
          "ml-[var(--space-8)] h-[var(--size-24)] min-w-0 flex-1 bg-transparent type-16 text-[var(--content-primary)] outline-none placeholder:text-[var(--content-muted)] disabled:cursor-not-allowed disabled:opacity-50",
          inputClassName
        )}
      />
      {endAdornment ? <span className="ml-[var(--space-8)] flex shrink-0 items-center">{endAdornment}</span> : null}
    </label>
  );
});

export type TagProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  add?: boolean;
  visualState?: Exclude<VisualState, "selected">;
};

export function Tag({ add, visualState = "default", className, children, ...props }: TagProps) {
  const tooltipLabel = typeof children === "string" || typeof children === "number" ? String(children) : undefined;
  const { ref: labelRef, overflowing } = useOverflowState<HTMLSpanElement>(tooltipLabel);
  const tag = (
    <button
      {...props}
      data-state={visualState}
      data-add={add ? "true" : undefined}
      type={props.type ?? "button"}
      className={cn(
        "inline-flex h-[var(--size-24)] min-w-0 max-w-[var(--tag-max-width)] items-center rounded-[var(--radius-round)] border border-transparent bg-[var(--tag-fill)] pl-[var(--space-12)] pr-[var(--space-12)] py-[var(--space-4)] type-12-semibold text-[var(--content-primary)] transition-[transform,background-color,border-color,color,opacity] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]",
        "hover:bg-[var(--tag-hover)] active:scale-[0.98] active:bg-[var(--tag-pressed)] data-[state=hover]:bg-[var(--tag-hover)] data-[state=pressed]:scale-[0.98] data-[state=pressed]:bg-[var(--tag-pressed)]",
        "data-[add=true]:border-[var(--add-tag-border)] data-[add=true]:border-dashed data-[add=true]:bg-[var(--add-tag-fill)] data-[add=true]:text-[var(--content-muted)]",
        "data-[add=true]:hover:border-[var(--add-tag-border-hover)] data-[add=true]:hover:bg-[var(--add-tag-hover)] data-[add=true]:hover:text-[var(--content-primary)]",
        "data-[add=true]:data-[state=hover]:border-[var(--add-tag-border-hover)] data-[add=true]:data-[state=hover]:bg-[var(--add-tag-hover)] data-[add=true]:data-[state=hover]:text-[var(--content-primary)]",
        "data-[add=true]:active:bg-[var(--add-tag-pressed)] data-[add=true]:data-[state=pressed]:bg-[var(--add-tag-pressed)] data-[add=true]:data-[state=pressed]:border-[var(--add-tag-border-pressed)] data-[add=true]:data-[state=pressed]:text-[var(--content-primary)]",
        props.disabled && "pointer-events-none opacity-45 grayscale-[0.2]",
        className
      )}
    >
      <span ref={labelRef} className="min-w-0 truncate">{children}</span>
    </button>
  );

  return tooltipLabel && overflowing && !props.disabled ? (
    <Tooltip label={tooltipLabel} side="top">
      {tag}
    </Tooltip>
  ) : tag;
}
export type TabProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  as?: "button" | "summary";
  selected?: boolean;
  hasMenu?: boolean;
  count?: number;
  showHash?: boolean;
  open?: boolean;
  visualState?: VisualState;
};

const tabClassName = cn(
  "inline-flex h-[var(--size-32)] shrink-0 cursor-pointer items-center justify-center gap-[var(--space-8)] overflow-hidden rounded-[var(--radius-10)] bg-[var(--card-control)] bg-clip-padding px-[var(--space-16)] py-[var(--space-6)] type-16 text-[var(--content-primary)] shadow-none transition-[filter,transform,background-color,opacity] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)]",
  "hover:bg-[var(--card-control-hover)] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]",
  "data-[state=hover]:bg-[var(--card-control-hover)] data-[state=open]:bg-[var(--card-control-open)] data-popup-open:bg-[var(--card-control-open)] data-[state=open]:text-[var(--card-control-open-text)] data-popup-open:text-[var(--card-control-open-text)] data-[state=open]:ring-1 data-popup-open:ring-1 data-[state=open]:ring-inset data-popup-open:ring-inset data-[state=open]:ring-[var(--card-control-open-ring)] data-popup-open:ring-[var(--card-control-open-ring)] data-[state=pressed]:scale-[0.98]",
  "data-[state=selected]:pointer-events-none data-[state=selected]:cursor-default data-[state=selected]:text-[var(--white)] data-[state=selected]:transition-none"
);

export const Tab = React.forwardRef<HTMLElement, TabProps>(function Tab(
  { as = "button", selected, hasMenu, count, showHash, open, visualState = "default", className, children, ...props },
  ref
) {
  const state = selected ? "selected" : open ? "open" : visualState;
  const sharedClassName = cn(
    tabClassName,
    "group/tab",
    hasMenu && "gap-[var(--space-4)]",
    selected && gradientClassName,
    props.disabled && "pointer-events-none opacity-45",
    className
  );
  const content = (
    <>
      {showHash ? (
        <span aria-hidden="true" className="text-[var(--tab-hash)] group-data-[state=selected]/tab:text-[var(--white)]">
          #
        </span>
      ) : null}
      <span className="min-w-0 max-w-[var(--tab-label-max-width)] truncate">{children}</span>
      {typeof count === "number" ? (
        <span className="text-[var(--tab-count)] group-data-[state=selected]/tab:text-[var(--tab-count-selected)]">
          {count}
        </span>
      ) : null}
      {hasMenu ? (
        <Icon
          icon={Icons.chevronDown}
          size={20}
          strokeWidth={1.8}
          className={cn("shrink-0 transition-transform duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] group-data-[popup-open]/tab:rotate-180", open && "rotate-180")}
        />
      ) : null}
    </>
  );

  if (as === "summary") {
    const summaryProps = { ...props } as React.HTMLAttributes<HTMLElement> & { disabled?: boolean; type?: string };
    delete summaryProps.disabled;
    delete summaryProps.type;

    return (
      <summary
        {...summaryProps}
        ref={ref as React.Ref<HTMLElement>}
        role={props.role ?? "tab"}
        aria-selected={selected}
        aria-expanded={hasMenu ? open : props["aria-expanded"]}
        data-state={state}
        className={cn(sharedClassName, "list-none [&::-webkit-details-marker]:hidden")}
      >
        {content}
      </summary>
    );
  }

  return (
    <button
      {...props}
      ref={ref as React.Ref<HTMLButtonElement>}
      role={props.role ?? "tab"}
      aria-selected={selected}
      aria-expanded={hasMenu ? open : props["aria-expanded"]}
      data-state={state}
      type={props.type ?? "button"}
      className={sharedClassName}
    >
      {content}
    </button>
  );
});

export type BrandLogoProps = {
  size?: number;
  className?: string;
};

export function BrandLogo({ size = 32, className }: BrandLogoProps) {
  const gradientId = React.useId().replace(/:/g, "");
  const gradientA = `${gradientId}-a`;
  const gradientB = `${gradientId}-b`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={cn("shrink-0", className)}
      style={{ width: size, height: size, minWidth: size, minHeight: size }}
    >
      <path
        d="M9.6178 16.0015C15.04 12.7355 18.6667 6.79125 18.6667 0H13.3334C13.3334 7.36382 7.36383 13.3334 0 13.3334V18.6697C3.58773 18.6697 6.84178 20.0841 9.24209 22.3898C9.30549 22.4507 9.36829 22.5122 9.43048 22.5743C10.3045 23.4485 11.0574 24.443 11.6623 25.5309C12.2886 23.5603 13.1935 21.7139 14.3306 20.0378C13.9724 19.6091 13.5954 19.1967 13.2009 18.8022L13.1998 18.8012C12.1278 17.7303 10.9251 16.7884 9.6178 16.0015Z"
        fill={`url(#${gradientA})`}
      />
      <path
        d="M22.3822 15.9985C16.96 19.2645 13.3333 25.2087 13.3333 32H18.6666C18.6666 24.6361 24.6362 18.6666 32 18.6666V13.3303C28.4122 13.3303 25.1582 11.9159 22.7579 9.61023C22.6945 9.54933 22.6317 9.48778 22.5695 9.42566C21.6954 8.55149 20.9425 7.55697 20.3377 6.4691C19.7114 8.43967 18.8065 10.2861 17.6693 11.9622C18.0276 12.3909 18.4046 12.8033 18.7991 13.1978L18.8001 13.1988C19.8721 14.2697 21.0749 15.2116 22.3822 15.9985Z"
        fill={`url(#${gradientB})`}
      />
      <defs>
        <linearGradient id={gradientA} x1="0" y1="16" x2="55.9429" y2="16" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--accent-start)" />
          <stop offset="1" stopColor="var(--accent-end)" />
        </linearGradient>
        <linearGradient id={gradientB} x1="0" y1="16" x2="55.9429" y2="16" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--accent-start)" />
          <stop offset="1" stopColor="var(--accent-end)" />
        </linearGradient>
      </defs>
    </svg>
  );
}


type MediaAssetImageProps = {
  src: string;
  alt: string;
  fit?: "contain" | "cover";
  onError: () => void;
  requireReadable?: boolean;
};

type MediaAssetProbeProps = {
  src: string;
  onLoad: (image: HTMLImageElement) => void;
  onError: () => void;
};

function getProxiedMediaSrc(src: string) {
  try {
    const url = new URL(src);

    if (url.protocol === "http:" || url.protocol === "https:") {
      return `/api/media-proxy?url=${encodeURIComponent(url.href)}`;
    }
  } catch {
    return src;
  }

  return src;
}

function analyzeImagePresentation(image: HTMLImageElement) {
  const canvas = document.createElement("canvas");
  const size = 32;
  const context = canvas.getContext("2d", { willReadFrequently: true });

  if (!context || image.naturalWidth === 0 || image.naturalHeight === 0) {
    return { readable: false };
  }

  canvas.width = size;
  canvas.height = size;
  context.drawImage(image, 0, 0, size, size);

  const { data } = context.getImageData(0, 0, size, size);
  const borderSize = 4;
  let borderPixels = 0;
  let opaqueBorderPixels = 0;
  let visiblePixels = 0;
  let readablePixels = 0;
  let red = 0;
  let green = 0;
  let blue = 0;
  let alphaWeight = 0;

  const addBorderPixel = (index: number) => {
    const alpha = data[index + 3] / 255;

    if (alpha < 0.15) {
      return;
    }

    red += data[index] * alpha;
    green += data[index + 1] * alpha;
    blue += data[index + 2] * alpha;
    alphaWeight += alpha;
  };

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const index = (y * size + x) * 4;
      const alpha = data[index + 3] / 255;

      if (alpha >= 0.15) {
        const luminance = data[index] * 0.2126 + data[index + 1] * 0.7152 + data[index + 2] * 0.0722;

        visiblePixels += 1;

        if (luminance < 238) {
          readablePixels += 1;
        }
      }

      if (x >= borderSize && x < size - borderSize && y >= borderSize && y < size - borderSize) {
        continue;
      }

      borderPixels += 1;

      if (alpha >= 0.15) {
        opaqueBorderPixels += 1;
      }

      addBorderPixel(index);
    }
  }

  const hasSolidEdges = borderPixels > 0 && opaqueBorderPixels / borderPixels >= 0.55;
  const backgroundColor = hasSolidEdges && alphaWeight > 0
    ? `rgb(${Math.round(red / alphaWeight)} ${Math.round(green / alphaWeight)} ${Math.round(blue / alphaWeight)})`
    : undefined;

  return {
    backgroundColor,
    readable: hasSolidEdges || (visiblePixels >= 10 && readablePixels / visiblePixels >= 0.18),
  };
}
function MediaAssetProbe({ src, onLoad, onError }: MediaAssetProbeProps) {
  const proxiedSrc = React.useMemo(() => getProxiedMediaSrc(src), [src]);

  return (
    <img
      src={proxiedSrc}
      alt=""
      aria-hidden="true"
      className="sr-only"
      decoding="async"
      onLoad={(event) => onLoad(event.currentTarget)}
      onError={onError}
    />
  );
}

function MediaAssetImage({ src, alt, fit = "contain", onError, requireReadable }: MediaAssetImageProps) {
  const [sampledBackground, setSampledBackground] = React.useState<{ src: string; color?: string }>();
  const proxiedSrc = React.useMemo(() => getProxiedMediaSrc(src), [src]);
  const backgroundColor = sampledBackground?.src === proxiedSrc ? sampledBackground.color : undefined;


  return (
    <>
      <span aria-hidden="true" className="absolute inset-0" style={{ backgroundColor }} />
      <img
        src={proxiedSrc}
        alt={alt}
        className={cn("relative z-10 size-full", fit === "cover" ? "object-cover" : "object-contain")}
        decoding="async"
        loading="lazy"
        onError={onError}
        onLoad={(event) => {
          try {
            const presentation = analyzeImagePresentation(event.currentTarget);

            if (requireReadable && !presentation.readable) {
              onError();
              return;
            }

            setSampledBackground({ src: proxiedSrc, color: presentation.backgroundColor });
          } catch {
            setSampledBackground({ src: proxiedSrc });
          }
        }}
      />
    </>
  );
}

export type LinkLogoProps = {
  src?: string;
  alt?: string;
  fallback: string;
  color?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
};

export function LinkLogo({
  src,
  alt = "",
  fallback,
  color = "var(--favicon-1)",
  size = "sm",
  className,
}: LinkLogoProps) {
  const [failedSrc, setFailedSrc] = React.useState<string | undefined>();
  const sizeClassName = {
    sm: "size-[var(--size-32)] rounded-[var(--radius-8)] type-16-semibold",
    md: "size-[var(--size-40)] rounded-[var(--radius-10)] type-16-semibold",
    lg: "size-[var(--size-48)] rounded-[var(--radius-12)] type-16-semibold",
  }[size];
  const imageSrc = src && failedSrc !== src ? src : undefined;
  const showImage = Boolean(imageSrc);

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center overflow-hidden",
        sizeClassName,
        className
      )}
      style={{ backgroundColor: showImage ? undefined : color, color: "var(--white)" }}
    >
      {imageSrc ? (
        <img src={imageSrc} alt={alt} className="size-full object-contain" onError={() => setFailedSrc(imageSrc)} />
      ) : (
        fallback.slice(0, 1).toUpperCase()
      )}
    </span>
  );
}


export type LinkPreviewCardProps = Omit<React.HTMLAttributes<HTMLElement>, "title"> & {
  title: string;
  description: string;
  url: string;
  previewImageSrc?: string;
  previewImageAlt?: string;
  logoSrc?: string;
  logoAlt?: string;
  logoFallback?: string;
  logoColor?: string;
  externalHref?: string;
  externalLabel?: string;
};


// Preview content is passive product data. Square-safe metadata imagery
// takes priority; wide social cards fall back to a large contained site/app
// logo so wordmarks stay readable instead of being cropped.
// The card itself is not interactive; only the external-link action is.
export function LinkPreviewCard({
  title,
  description,
  url,
  previewImageSrc,
  previewImageAlt = "",
  logoSrc,
  logoAlt = "",
  logoFallback,
  logoColor = "var(--content-primary)",
  externalHref,
  externalLabel = "Open preview link",
  className,
  ...props
}: LinkPreviewCardProps) {
  const [failedPreviewSrc, setFailedPreviewSrc] = React.useState<string | undefined>();
  const [safePreviewSrc, setSafePreviewSrc] = React.useState<string | undefined>();
  const [unsafePreviewSrc, setUnsafePreviewSrc] = React.useState<string | undefined>();
  const [failedLogoSrc, setFailedLogoSrc] = React.useState<string | undefined>();
  const fallback = (logoFallback ?? title).slice(0, 1).toUpperCase();
  const previewAssetSrc =
    previewImageSrc && safePreviewSrc === previewImageSrc && failedPreviewSrc !== previewImageSrc ? previewImageSrc : undefined;
  const shouldMeasurePreviewImage = Boolean(
    previewImageSrc &&
      safePreviewSrc !== previewImageSrc &&
      unsafePreviewSrc !== previewImageSrc &&
      failedPreviewSrc !== previewImageSrc
  );
  const logoAssetSrc = logoSrc && failedLogoSrc !== logoSrc ? logoSrc : undefined;

  return (
    <article
      {...props}
      className={cn(
        "flex h-[var(--preview-card-height)] w-full gap-[var(--space-16)] rounded-[var(--radius-24)] bg-[var(--card-active-surface)] p-[var(--space-8)] pr-[var(--space-16)] text-[var(--content-primary)]",
        className
      )}
    >
      {previewImageSrc && shouldMeasurePreviewImage ? (
        <MediaAssetProbe
          src={previewImageSrc}
          onLoad={(image) => {
            const { naturalHeight, naturalWidth } = image;
            const aspectRatio = naturalHeight > 0 ? naturalWidth / naturalHeight : 0;

            if (aspectRatio >= COMPACT_PREVIEW_MIN_ASPECT_RATIO && aspectRatio <= COMPACT_PREVIEW_MAX_ASPECT_RATIO) {
              setSafePreviewSrc(previewImageSrc);
            } else {
              setUnsafePreviewSrc(previewImageSrc);
            }
          }}
          onError={() => setFailedPreviewSrc(previewImageSrc)}
        />
      ) : null}

      <div
        className="relative flex size-[var(--preview-media-size)] shrink-0 items-center justify-center overflow-hidden rounded-[var(--radius-16)]"
        style={{ backgroundColor: previewAssetSrc ? undefined : logoColor, color: "var(--white)" }}
      >
        {previewAssetSrc ? (
          <MediaAssetImage src={previewAssetSrc} alt={previewImageAlt} fit="cover" onError={() => setFailedPreviewSrc(previewAssetSrc)} />
        ) : logoAssetSrc ? (
          <MediaAssetImage src={logoAssetSrc} alt={logoAlt} onError={() => setFailedLogoSrc(logoAssetSrc)} />
        ) : fallback ? (
          <span className="type-logo-letter">{fallback}</span>
        ) : (
          <Icon icon={Icons.fileImage} size={20} />
        )}
      </div>

      <div className="flex h-[var(--preview-media-size)] min-w-0 flex-1 flex-col justify-between gap-[var(--space-8)] py-[var(--space-8)]">
        <div className="min-h-0 min-w-0">
          <h3 className="truncate type-16-semibold text-[var(--content-primary)]">{title}</h3>
          <p className="mt-[var(--space-4)] line-clamp-2 whitespace-pre-line type-16 text-[var(--content-muted)]">
            {description}
          </p>
        </div>

        <div className="flex h-[var(--size-24)] shrink-0 items-center justify-between gap-[var(--space-8)] type-12 text-[var(--content-muted)]">
          <span className="min-w-0 truncate">{url}</span>
          <IconButton
            icon={Icons.external}
            label={externalLabel}
            mode="plain"
            href={externalHref}
            disabled={!externalHref}
            target={externalHref ? "_blank" : undefined}
            rel={externalHref ? "noreferrer" : undefined}
            tooltipSide="left"
          />
        </div>
      </div>
    </article>
  );
}

export type SavedReasonProps = React.HTMLAttributes<HTMLElement> & {
  reason: string;
  label?: string;
  maxLength?: number | null;
};

const SAVED_REASON_MAX_LENGTH = 220;

function truncateSavedReason(reason: string, maxLength?: number | null) {
  const normalizedReason = reason.trim();

  if (typeof maxLength !== "number" || normalizedReason.length <= maxLength) {
    return normalizedReason;
  }

  return `${normalizedReason.slice(0, maxLength).trimEnd()}...`;
}

export function SavedReason({ reason, label = "Why I saved this", maxLength = SAVED_REASON_MAX_LENGTH, className, ...props }: SavedReasonProps) {
  const visibleReason = truncateSavedReason(reason, maxLength);

  return (
    <figure {...props} aria-label={label} className={cn("saved-reason", className)}>
      <figcaption className="saved-reason-label type-label">{label}</figcaption>
      <blockquote className="saved-reason-note type-saved-reason">
        {visibleReason}
      </blockquote>
    </figure>
  );
}
export { BookmarkIcon, Icons };






