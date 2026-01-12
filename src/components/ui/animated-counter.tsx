import * as React from "react";
import { motion, useSpring, useTransform, useMotionValue } from "framer-motion";
import { cn } from "@/lib/utils";

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  className?: string;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  formatOptions?: Intl.NumberFormatOptions;
  locale?: string;
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  duration = 1.5,
  className,
  prefix = "",
  suffix = "",
  decimals = 0,
  formatOptions,
  locale = "pt-BR",
}) => {
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, {
    damping: 50,
    stiffness: 100,
    duration: duration * 1000,
  });

  const displayValue = useTransform(springValue, (latest) => {
    if (formatOptions) {
      return latest.toLocaleString(locale, formatOptions);
    }
    return latest.toLocaleString(locale, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  });

  React.useEffect(() => {
    motionValue.set(value);
  }, [value, motionValue]);

  return (
    <motion.span
      className={cn("tabular-nums", className)}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {prefix}
      <motion.span>{displayValue}</motion.span>
      {suffix}
    </motion.span>
  );
};

// Currency variant
interface AnimatedCurrencyProps {
  value: number;
  currency?: string;
  className?: string;
  duration?: number;
}

export const AnimatedCurrency: React.FC<AnimatedCurrencyProps> = ({
  value,
  currency = "BRL",
  className,
  duration = 1.5,
}) => {
  return (
    <AnimatedCounter
      value={value}
      duration={duration}
      className={className}
      formatOptions={{
        style: "currency",
        currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }}
    />
  );
};

// Percentage variant
interface AnimatedPercentageProps {
  value: number;
  className?: string;
  duration?: number;
  showSign?: boolean;
}

export const AnimatedPercentage: React.FC<AnimatedPercentageProps> = ({
  value,
  className,
  duration = 1.5,
  showSign = false,
}) => {
  const sign = showSign && value > 0 ? "+" : "";
  
  return (
    <AnimatedCounter
      value={value}
      duration={duration}
      className={className}
      decimals={1}
      prefix={sign}
      suffix="%"
    />
  );
};
