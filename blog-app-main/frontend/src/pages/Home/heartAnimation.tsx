import { AnimatePresence, motion } from "framer-motion";
import { Heart } from "lucide-react";

const heartVariants = {
  hidden: { scale: 0, opacity: 0 },
  visible: {
    scale: [0, 1.5, 1],
    opacity: 1,
    transition: {
      type: "tween",
      stiffness: 300,
      damping: 20,
    },
  },
  exit: {
    scale: 0.5,
    opacity: 0,
    y: -100,
    transition: { duration: 0.6 },
  },
};

const drizzleHearts = Array.from({ length: 10 }).map((_, i) => ({
  id: i,
  style: {
    left: `${Math.random() * 100}%`,
    animationDelay: `${Math.random() * 2}s`,
  },
}));

export const HeartAnimation = ({ showHeart }: { showHeart: boolean }) => {
  return (
    <AnimatePresence>
      {showHeart && (
        <>
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            variants={heartVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <Heart
              size={90}
              className="text-red-600 fill-red-500 drop-shadow-lg"
            />
          </motion.div>

          {drizzleHearts.map(({ id, style }) => (
            <motion.div
              key={id}
              className="absolute text-white"
              initial={{ y: -100, opacity: 0 }}
              animate={{ y: "100vh", opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 3, ease: "easeInOut" }}
              style={{
                position: "absolute",
                ...style,
              }}
            >
              <Heart
                size={20 + Math.random() * 20}
                className="fill-red-400 text-white opacity-80"
              />
            </motion.div>
          ))}
        </>
      )}
    </AnimatePresence>
  );
};
