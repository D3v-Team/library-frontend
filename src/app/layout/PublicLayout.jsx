import { Outlet } from "react-router-dom";
import { useState } from "react";

import Header from "../../Components/Common/Login/Header/Header";
import Footer from "../../Components/Common/Login/Footer/Footer";
import BackToTop from "../../Components/Common/BackToTop";
import Message from "../../Components/Common/Messag";

export default function PublicLayout() {
  const [messageOpen, setMessageOpen] = useState(false);

  return (
    <>
      <Header onMessageOpen={() => setMessageOpen(true)} />

      <main>
        <Outlet />
      </main>

      <Message
        open={messageOpen}
        onOpen={() => {
          setMessageOpen(true);
        }}
        onClose={() => {
          setMessageOpen(false);
        }}
      />
      <BackToTop />

      <Footer />
    </>
  );
}
