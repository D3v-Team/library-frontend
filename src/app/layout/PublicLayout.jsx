import { Outlet, useLocation } from "react-router-dom";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import Header from "../../Components/Common/Login/Header/Header";
import Footer from "../../Components/Common/Login/Footer/Footer";
import BackToTop from "../../Components/Common/BackToTop";
import Message from "../../Components/Common/Messag";

const pageVariants = {
  initial: {
    opacity: 0,
    y: 18,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.38,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: {
      duration: 0.22,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
};

export default function PublicLayout() {
  const [messageOpen, setMessageOpen] = useState(false);
  const location = useLocation();

  return (
    <>
      <Header onMessageOpen={() => setMessageOpen(true)} />

      <main>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={location.pathname}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      <Message
        open={messageOpen}
        onOpen={() => setMessageOpen(true)}
        onClose={() => setMessageOpen(false)}
      />
      <BackToTop />

      <Footer />
    </>
  );
}
