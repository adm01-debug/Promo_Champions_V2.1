import React, { ReactNode } from "react";
import { TabsContent } from "@/components/ui/tabs";
import { motion } from "framer-motion";

interface AnimatedTabContentProps {
  value: string;
  children: ReactNode;
}

const tabAnimation = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: { duration: 0.3 },
};

export const AnimatedTabContent = React.memo(function AnimatedTabContent({ value, children }: AnimatedTabContentProps) {
  return (
    <TabsContent value={value} className="space-y-4">
      <motion.div {...tabAnimation}>
        {children}
      </motion.div>
    </TabsContent>
  );
});
