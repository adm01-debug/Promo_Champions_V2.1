import { FC, ReactNode } from "react";
import { LucideIcon, Inbox, Plus, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

interface PremiumEmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  /** Primary CTA */
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  /** Secondary CTA */
  secondaryLabel?: string;
  secondaryHref?: string;
  /** Visual variant */
  variant?: "default" | "compact" | "inline";
  /** Optional custom illustration */
  illustration?: ReactNode;
  className?: string;
}

export const PremiumEmptyState: FC<PremiumEmptyStateProps> = ({
  icon: Icon = Inbox,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  secondaryLabel,
  secondaryHref,
  variant = "default",
  illustration,
  className,
}) => {
  const isCompact = variant === "compact";
  const isInline = variant === "inline";

  if (isInline) {
    return (
      <div className={cn(
        "flex items-center gap-3 p-4 rounded-xl border border-dashed border-border/60 bg-muted/20",
        className
      )}>
        <div className="p-2 rounded-lg bg-primary/10">
          <Icon className="h-4 w-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-label text-foreground">{title}</p>
          <p className="text-caption truncate">{description}</p>
        </div>
        {actionLabel && actionHref && (
          <Button asChild variant="ghost" size="sm" className="shrink-0">
            <Link to={actionHref}>
              {actionLabel}
              <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Link>
          </Button>
        )}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      className={cn(
        "relative overflow-hidden rounded-2xl border border-dashed border-border/50",
        "bg-gradient-to-br from-muted/30 via-card to-muted/20",
        isCompact ? "p-6" : "p-8 sm:p-12",
        className
      )}
    >
      {/* Decorative dots */}
      <div className="absolute inset-0 opacity-[0.015] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, hsl(var(--foreground)) 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }}
      />

      <div className={cn(
        "relative flex flex-col items-center text-center",
        isCompact ? "gap-3" : "gap-4"
      )}>
        {illustration || (
          <div className={cn(
            "relative",
            isCompact ? "mb-1" : "mb-2"
          )}>
            <div className={cn(
              "rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/10",
              "flex items-center justify-center",
              isCompact ? "h-12 w-12" : "h-16 w-16"
            )}>
              <Icon className={cn(
                "text-primary",
                isCompact ? "h-6 w-6" : "h-8 w-8"
              )} />
            </div>
            {/* Glow ring */}
            <div className="absolute inset-0 rounded-2xl bg-primary/5 blur-xl -z-10 scale-150" />
          </div>
        )}

        <div className="space-y-1.5 max-w-md">
          <h3 className={cn(
            "font-display font-semibold text-foreground",
            isCompact ? "text-base" : "text-lg"
          )}>
            {title}
          </h3>
          <p className={cn(
            "text-muted-foreground leading-relaxed",
            isCompact ? "text-xs" : "text-sm"
          )}>
            {description}
          </p>
        </div>

        {(actionLabel || secondaryLabel) && (
          <div className={cn(
            "flex items-center gap-2",
            isCompact ? "mt-1" : "mt-2"
          )}>
            {actionLabel && (
              actionHref ? (
                <Button asChild size={isCompact ? "sm" : "default"}>
                  <Link to={actionHref}>
                    <Plus className="h-4 w-4 mr-1.5" />
                    {actionLabel}
                  </Link>
                </Button>
              ) : (
                <Button size={isCompact ? "sm" : "default"} onClick={onAction}>
                  <Plus className="h-4 w-4 mr-1.5" />
                  {actionLabel}
                </Button>
              )
            )}
            {secondaryLabel && secondaryHref && (
              <Button asChild variant="ghost" size={isCompact ? "sm" : "default"}>
                <Link to={secondaryHref}>
                  {secondaryLabel}
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};
