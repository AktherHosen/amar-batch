import { motion  } from 'framer-motion';
import type {Variants} from 'framer-motion';
import type { ReactNode } from 'react';

const pageVariants: Variants = {
    initial: { opacity: 0, y: 20 },
    animate: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.3, ease: 'easeOut' },
    },
    exit: {
        opacity: 0,
        y: -10,
        transition: { duration: 0.2 },
    },
};

export function PageTransition({ children }: { children: ReactNode }) {
    return (
        <motion.div
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
        >
            {children}
        </motion.div>
    );
}

const staggerContainer: Variants = {
    animate: {
        transition: {
            staggerChildren: 0.05,
        },
    },
};

const fadeInUp: Variants = {
    initial: { opacity: 0, y: 15 },
    animate: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.3, ease: 'easeOut' },
    },
};

export function StaggerChildren({ children }: { children: ReactNode }) {
    return (
        <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
        >
            {children}
        </motion.div>
    );
}

export function FadeInUp({ children, className }: { children: ReactNode; className?: string }) {
    return (
        <motion.div variants={fadeInUp} className={className}>
            {children}
        </motion.div>
    );
}

const scaleIn: Variants = {
    initial: { opacity: 0, scale: 0.95 },
    animate: {
        opacity: 1,
        scale: 1,
        transition: { duration: 0.2, ease: 'easeOut' },
    },
};

export function ScaleIn({ children, className }: { children: ReactNode; className?: string }) {
    return (
        <motion.div variants={scaleIn} initial="initial" animate="animate" className={className}>
            {children}
        </motion.div>
    );
}

const slideIn: Variants = {
    initial: { opacity: 0, x: -20 },
    animate: {
        opacity: 1,
        x: 0,
        transition: { duration: 0.3, ease: 'easeOut' },
    },
};

export function SlideIn({ children, className }: { children: ReactNode; className?: string }) {
    return (
        <motion.div variants={slideIn} initial="initial" animate="animate" className={className}>
            {children}
        </motion.div>
    );
}

export function AnimatedCard({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{
                opacity: 1,
                y: 0,
                transition: { duration: 0.3, delay, ease: 'easeOut' },
            }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

export function AnimatedTableRow({ children, index }: { children: ReactNode; index: number }) {
    return (
        <motion.tr
            initial={{ opacity: 0, x: -10 }}
            animate={{
                opacity: 1,
                x: 0,
                transition: { duration: 0.2, delay: index * 0.03, ease: 'easeOut' },
            }}
        >
            {children}
        </motion.tr>
    );
}
