import * as React from "react";
import { cn } from "@/lib/utils";
import { Check, AlertCircle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface AnimatedInputProps extends React.ComponentProps<"input"> {
  error?: boolean;
  errorMessage?: string;
  success?: boolean;
  successMessage?: string;
  loading?: boolean;
  showIcon?: boolean;
}

const AnimatedInput = React.forwardRef<HTMLInputElement, AnimatedInputProps>(
  ({ 
    className, 
    type, 
    error, 
    errorMessage,
    success,
    successMessage,
    loading,
    showIcon = true,
    ...props 
  }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false);

    return (
      <div className="relative w-full">
        <motion.div
          animate={{
            scale: error ? [1, 1.02, 0.98, 1] : 1,
          }}
          transition={{ duration: 0.3 }}
        >
          <input
            type={type}
            className={cn(
              "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm transition-all duration-200",
              error && "border-destructive focus-visible:ring-destructive pr-10",
              success && "border-green-500 focus-visible:ring-green-500 pr-10",
              loading && "pr-10",
              isFocused && !error && !success && "border-primary",
              className,
            )}
            ref={ref}
            onFocus={(e) => {
              setIsFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              props.onBlur?.(e);
            }}
            {...props}
          />
        </motion.div>

        {/* Status Icons */}
        {showIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <AnimatePresence mode="wait">
              {loading && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                >
                  <Loader2 className="h-4 w-4 text-muted-foreground animate-spin" />
                </motion.div>
              )}
              {error && !loading && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, scale: 0.5, rotate: -90 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  transition={{ type: "spring", stiffness: 500, damping: 25 }}
                >
                  <AlertCircle className="h-4 w-4 text-destructive" />
                </motion.div>
              )}
              {success && !loading && !error && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  transition={{ type: "spring", stiffness: 500, damping: 25 }}
                >
                  <Check className="h-4 w-4 text-green-500" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Error/Success Messages */}
        <AnimatePresence>
          {error && errorMessage && (
            <motion.p
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              className="text-sm text-destructive mt-1.5 flex items-center gap-1"
            >
              {errorMessage}
            </motion.p>
          )}
          {success && successMessage && !error && (
            <motion.p
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              className="text-sm text-green-600 mt-1.5 flex items-center gap-1"
            >
              {successMessage}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    );
  },
);

AnimatedInput.displayName = "AnimatedInput";

export { AnimatedInput };
