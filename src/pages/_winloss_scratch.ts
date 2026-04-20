import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { useMemo, useState } from "framer-motion/dist/framer-motion";

// fix import — framer-motion does not export hooks from /dist; use react below
