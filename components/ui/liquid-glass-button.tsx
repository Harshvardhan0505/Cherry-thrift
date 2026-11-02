"use client"

// Three buttons: shadcn's plain Button, a LiquidButton of warped glass, and a
// MetalButton with a pressed, metallic finish.
//
// Adapted for Cherry Thrifts:
// - the shop's colours instead of shadcn's theme tokens, and a "cherry" metal;
// - each LiquidButton has its own glass filter (they shared one id, which
//   breaks with more than one on a page), plus a frosted layer underneath, as
//   only Chrome and Edge draw the warp - Safari and Firefox still get glass;
// - LiquidButton is always a <button> (the slot couldn't take its layers), and
//   its content is a <span>, which a button may contain;
// - MetalButton can be a link (`href`), takes a wrapper class for full-width
//   use, and shows hover only for a mouse, read from the pointer itself.

import * as React from "react"
import Link from "next/link"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center cursor-pointer justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cherry disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-cherry text-white hover:bg-cherry/90",
        destructive: "bg-wine text-white hover:bg-wine/90",
        cool: "bg-linear-to-t border border-b-2 border-wine/40 from-cherry to-cherry/85 shadow-md shadow-cherry/20 ring-1 ring-inset ring-white/25 transition-[filter] duration-200 hover:brightness-110 active:brightness-90 text-white",
        outline: "border border-petal bg-white hover:bg-blush hover:text-cherry",
        secondary: "bg-petal text-wine hover:bg-petal/80",
        ghost: "hover:bg-blush hover:text-cherry",
        link: "text-cherry underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants, liquidbuttonVariants, LiquidButton }

const liquidbuttonVariants = cva(
  "inline-flex items-center justify-center cursor-pointer gap-2 whitespace-nowrap rounded-full text-sm font-medium transition-[color,box-shadow,transform] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-white/70 focus-visible:ring-[3px]",
  {
    variants: {
      variant: {
        default: "bg-transparent hover:scale-105 duration-300 text-cherry",
        // For glass over a photo: white text that stays readable on any colour.
        light: "bg-transparent hover:scale-105 duration-300 text-white [text-shadow:0_1px_10px_rgb(0_0_0/0.45)]",
        outline: "border border-petal bg-white hover:bg-blush hover:text-cherry",
        secondary: "bg-petal text-wine hover:bg-petal/80",
        ghost: "hover:bg-blush hover:text-cherry",
        link: "text-cherry underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 text-xs gap-1.5 px-4 has-[>svg]:px-4",
        lg: "h-10 px-6 has-[>svg]:px-4",
        xl: "h-12 px-8 has-[>svg]:px-6",
        xxl: "h-14 px-10 has-[>svg]:px-8",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "xxl",
    },
  }
)

function LiquidButton({
  className,
  variant,
  size,
  children,
  ...props
}: React.ComponentProps<"button"> & VariantProps<typeof liquidbuttonVariants>) {
  // Filter ids must be unique on the page, and plain letters to work in url().
  const filterId = `glass-${React.useId().replace(/[^a-zA-Z0-9_-]/g, "")}`

  return (
    <button
      data-slot="button"
      className={cn("relative isolate", liquidbuttonVariants({ variant, size, className }))}
      {...props}
    >
      {/* The glass edge: light and shade around the rim. */}
      <span
        aria-hidden="true"
        className="absolute top-0 left-0 z-0 h-full w-full rounded-full transition-all shadow-[0_0_6px_rgba(0,0,0,0.03),0_2px_6px_rgba(0,0,0,0.08),inset_3px_3px_0.5px_-3px_rgba(0,0,0,0.9),inset_-3px_-3px_0.5px_-3px_rgba(0,0,0,0.85),inset_1px_1px_1px_-0.5px_rgba(0,0,0,0.6),inset_-1px_-1px_1px_-0.5px_rgba(0,0,0,0.6),inset_0_0_6px_6px_rgba(0,0,0,0.12),inset_0_0_2px_2px_rgba(0,0,0,0.06),0_0_12px_rgba(255,255,255,0.15)]"
      />
      {/* Frosted glass, which every browser draws... */}
      <span
        aria-hidden="true"
        className="absolute top-0 left-0 -z-20 h-full w-full overflow-hidden rounded-full bg-white/10 backdrop-blur-[6px]"
      />
      {/* ...and the warp on top, where the browser can draw it (Chrome, Edge). */}
      <span
        aria-hidden="true"
        className="absolute top-0 left-0 -z-10 h-full w-full overflow-hidden rounded-full"
        style={{ backdropFilter: `url("#${filterId}")` }}
      />

      <span className="pointer-events-none relative z-10 inline-flex items-center gap-2">
        {children}
      </span>
      <GlassFilter id={filterId} />
    </button>
  )
}


function GlassFilter({ id }: { id: string }) {
  return (
    <svg className="hidden" aria-hidden="true">
      <defs>
        <filter
          id={id}
          x="0%"
          y="0%"
          width="100%"
          height="100%"
          colorInterpolationFilters="sRGB"
        >
          {/* Generate turbulent noise for distortion */}
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.05 0.05"
            numOctaves="1"
            seed="1"
            result="turbulence"
          />

          {/* Blur the turbulence pattern slightly */}
          <feGaussianBlur in="turbulence" stdDeviation="2" result="blurredNoise" />

          {/* Displace the source graphic with the noise */}
          <feDisplacementMap
            in="SourceGraphic"
            in2="blurredNoise"
            scale="70"
            xChannelSelector="R"
            yChannelSelector="B"
            result="displaced"
          />

          {/* Apply overall blur on the final result */}
          <feGaussianBlur in="displaced" stdDeviation="4" result="finalBlur" />

          {/* Output the result */}
          <feComposite in="finalBlur" in2="finalBlur" operator="over" />
        </filter>
      </defs>
    </svg>
  );
}

type ColorVariant =
  | "default"
  | "cherry"
  | "success"
  | "error"
  | "gold"
  | "bronze";

type MetalButtonProps = {
  variant?: ColorVariant;
  /** Renders a link instead of a button. */
  href?: string;
  /** Classes for the outer rim, e.g. `w-full` to stretch it. */
  wrapperClassName?: string;
  className?: string;
  children?: React.ReactNode;
} & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children">;

const colorVariants: Record<
  ColorVariant,
  {
    outer: string;
    inner: string;
    button: string;
    textColor: string;
    textShadow: string;
  }
> = {
  default: {
    outer: "bg-gradient-to-b from-[#000] to-[#A0A0A0]",
    inner: "bg-gradient-to-b from-[#FAFAFA] via-[#3E3E3E] to-[#E5E5E5]",
    button: "bg-gradient-to-b from-[#B9B9B9] to-[#969696]",
    textColor: "text-white",
    textShadow: "[text-shadow:_0_-1px_0_rgb(80_80_80_/_100%)]",
  },
  // The shop's own: a polished cherry with a blush rim.
  cherry: {
    outer: "bg-gradient-to-b from-[#5C0F24] to-[#F3C9D2]",
    inner: "bg-gradient-to-b from-[#FDE7EC] via-[#7A0F2C] to-[#FBD5DD]",
    button: "bg-gradient-to-b from-[#D23A63] to-[#A30F37]",
    textColor: "text-white",
    textShadow: "[text-shadow:_0_-1px_0_rgb(110_10_38_/_100%)]",
  },
  success: {
    outer: "bg-gradient-to-b from-[#005A43] to-[#7CCB9B]",
    inner: "bg-gradient-to-b from-[#E5F8F0] via-[#00352F] to-[#D1F0E6]",
    button: "bg-gradient-to-b from-[#9ADBC8] to-[#3E8F7C]",
    textColor: "text-[#FFF7F0]",
    textShadow: "[text-shadow:_0_-1px_0_rgb(6_78_59_/_100%)]",
  },
  error: {
    outer: "bg-gradient-to-b from-[#5A0000] to-[#FFAEB0]",
    inner: "bg-gradient-to-b from-[#FFDEDE] via-[#680002] to-[#FFE9E9]",
    button: "bg-gradient-to-b from-[#F08D8F] to-[#A45253]",
    textColor: "text-[#FFF7F0]",
    textShadow: "[text-shadow:_0_-1px_0_rgb(146_64_14_/_100%)]",
  },
  gold: {
    outer: "bg-gradient-to-b from-[#917100] to-[#EAD98F]",
    inner: "bg-gradient-to-b from-[#FFFDDD] via-[#856807] to-[#FFF1B3]",
    button: "bg-gradient-to-b from-[#FFEBA1] to-[#9B873F]",
    textColor: "text-[#FFFDE5]",
    textShadow: "[text-shadow:_0_-1px_0_rgb(178_140_2_/_100%)]",
  },
  bronze: {
    outer: "bg-gradient-to-b from-[#864813] to-[#E9B486]",
    inner: "bg-gradient-to-b from-[#EDC5A1] via-[#5F2D01] to-[#FFDEC1]",
    button: "bg-gradient-to-b from-[#FFE3C9] to-[#A36F3D]",
    textColor: "text-[#FFF7F0]",
    textShadow: "[text-shadow:_0_-1px_0_rgb(124_45_18_/_100%)]",
  },
};

const metalButtonVariants = (
  variant: ColorVariant = "default",
  isPressed: boolean,
  isHovered: boolean,
) => {
  const colors = colorVariants[variant];
  const transitionStyle = "all 250ms cubic-bezier(0.1, 0.4, 0.2, 1)";

  return {
    wrapper: cn(
      "relative inline-flex transform-gpu rounded-md p-[1.25px] will-change-transform",
      colors.outer,
    ),
    wrapperStyle: {
      transform: isPressed
        ? "translateY(2.5px) scale(0.99)"
        : "translateY(0) scale(1)",
      boxShadow: isPressed
        ? "0 1px 2px rgba(0, 0, 0, 0.15)"
        : isHovered
          ? "0 4px 12px rgba(0, 0, 0, 0.12)"
          : "0 3px 8px rgba(0, 0, 0, 0.08)",
      transition: transitionStyle,
      transformOrigin: "center center",
    },
    inner: cn(
      "absolute inset-[1px] transform-gpu rounded-lg will-change-transform",
      colors.inner,
    ),
    innerStyle: {
      transition: transitionStyle,
      transformOrigin: "center center",
      filter: isHovered && !isPressed ? "brightness(1.05)" : "none",
    },
    button: cn(
      "relative z-10 m-[1px] rounded-md inline-flex h-11 transform-gpu cursor-pointer items-center justify-center overflow-hidden px-6 py-2 text-sm leading-none font-semibold will-change-transform outline-none focus-visible:ring-2 focus-visible:ring-white/70",
      colors.button,
      colors.textColor,
      colors.textShadow,
    ),
    buttonStyle: {
      transform: isPressed ? "scale(0.97)" : "scale(1)",
      transition: transitionStyle,
      transformOrigin: "center center",
      filter: isHovered && !isPressed ? "brightness(1.02)" : "none",
    },
  };
};

const ShineEffect = ({ isPressed }: { isPressed: boolean }) => {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 z-20 overflow-hidden transition-opacity duration-300",
        isPressed ? "opacity-20" : "opacity-0",
      )}
    >
      <span className="absolute inset-0 rounded-md bg-gradient-to-r from-transparent via-neutral-100 to-transparent" />
    </span>
  );
};

export function MetalButton({
  children,
  className,
  wrapperClassName,
  variant = "default",
  href,
  ...props
}: MetalButtonProps) {
  const [isPressed, setIsPressed] = React.useState(false);
  const [isHovered, setIsHovered] = React.useState(false);

  const variants = metalButtonVariants(variant, isPressed, isHovered);

  // Pointer events cover mouse and touch alike; hover is only for a mouse.
  const handlers = {
    onPointerDown: () => setIsPressed(true),
    onPointerUp: () => setIsPressed(false),
    onPointerCancel: () => setIsPressed(false),
    onPointerEnter: (event: React.PointerEvent) => {
      if (event.pointerType === "mouse") setIsHovered(true);
    },
    onPointerLeave: () => {
      setIsPressed(false);
      setIsHovered(false);
    },
  };

  const content = (
    <>
      <ShineEffect isPressed={isPressed} />
      {children || "Button"}
      {isHovered && !isPressed && (
        <span aria-hidden="true" className="pointer-events-none absolute inset-0 rounded-lg bg-gradient-to-t from-transparent to-white/5" />
      )}
    </>
  );

  return (
    <div className={cn(variants.wrapper, wrapperClassName)} style={variants.wrapperStyle}>
      <div className={variants.inner} style={variants.innerStyle}></div>
      {href ? (
        <Link
          href={href}
          className={cn(variants.button, className)}
          style={variants.buttonStyle}
          onClick={props.onClick as React.MouseEventHandler<HTMLAnchorElement> | undefined}
          {...handlers}
        >
          {content}
        </Link>
      ) : (
        <button
          className={cn(variants.button, className)}
          style={variants.buttonStyle}
          {...props}
          {...handlers}
        >
          {content}
        </button>
      )}
    </div>
  );
}
