import { Outlet, useLocation } from "react-router-dom";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import Header from "../../layouts/Header";
import Footer from "../../layouts/Footer";
import BookOrderModal from "../../layouts/BookOrderModal";
import BackToTop from "../../Components/Common/BackToTop";
import Message from "../../Components/Common/Messag";
import SkipLink from "../../ui/SkipLink";
import MotifDefs from "../../design/motifs/MotifDefs";

/**
 * Naqsh 6 — sahifa krossfeydi.
 *
 * Ilgari sahifa 18px pastdan sakrab chiqar va 10px yuqoriga chiqib
 * ketardi (jami 380ms + 220ms). Bu ikki muammo tug'dirardi:
 * har o'tishda butun sahifa siljigani uchun ko'z "yozuvni" yo'qotardi,
 * va uzun sahifalarda bu siljish layout ni qayta hisoblashga majbur
 * qilardi.
 *
 * Endi faqat opasitet, 240ms. Pozitsiya o'zgarmaydi — kontent
 * joyida almashadi.
 */
const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.24, ease: [0.16, 1, 0.3, 1] } },
  exit: { opacity: 0, transition: { duration: 0.16, ease: [0.16, 1, 0.3, 1] } },
};

export default function PublicLayout() {
  const [messageOpen, setMessageOpen] = useState(false);
  const [bookOrderOpen, setBookOrderOpen] = useState(false);
  const location = useLocation();

  return (
    // data-surface — dizayn tizimining public sirti.
    // base.css sarlavha shriftini shu nishonga bog'laydi, shunda
    // admin panel o'z interfeys shriftida qoladi.
    //
    // flex + min-h-dvh: footer sahifa qisqa bo'lganda ham pastga
    // yopishadi (Footer da `mt-auto`). Ilgari qisqa sahifalarda
    // footer o'rtada suzib turardi.
    <div data-surface="public" className="flex min-h-dvh flex-col">
      {/* Peshtoq maskalari — CSS `clip-path: url(#...)` uchun
          hujjatda bir marta mavjud bo'lishi kerak */}
      <MotifDefs />

      <SkipLink targetId="main-content" />

      <Header
        onMessageOpen={() => setMessageOpen(true)}
        onBookOrderOpen={() => setBookOrderOpen(true)}
      />

      {/* id — skip-link nishoni; tabIndex -1 fokusni shu yerga o'tkazadi */}
      <main id="main-content" tabIndex={-1} className="flex-1">
        <AnimatePresence mode="wait">
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

      <BookOrderModal open={bookOrderOpen} onClose={() => setBookOrderOpen(false)} />

      <BackToTop />

      <Footer />
    </div>
  );
}
