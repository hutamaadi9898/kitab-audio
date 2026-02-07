import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const easeOut = [0.22, 1, 0.36, 1] as const;

export default function ScrollToTop() {
    const [isVisible, setIsVisible] = React.useState(false);

    React.useEffect(() => {
        const toggleVisibility = () => {
            setIsVisible(window.scrollY > 400);
        };

        window.addEventListener('scroll', toggleVisibility, { passive: true });
        return () => window.removeEventListener('scroll', toggleVisibility);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.button
                    type="button"
                    onClick={scrollToTop}
                    className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full bg-limelight text-ink shadow-glow flex items-center justify-center hover:bg-limelight/90 active:scale-95 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-limelight/50 focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: 20 }}
                    transition={{ duration: 0.3, ease: easeOut }}
                    aria-label="Scroll to top"
                >
                    <svg
                        className="w-5 h-5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        aria-hidden="true"
                    >
                        <path
                            d="M18 15l-6-6-6 6"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </motion.button>
            )}
        </AnimatePresence>
    );
}
