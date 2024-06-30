"use client";

import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

const NAV_MENU = [
  {
    name: "Back to Game",
    icon: "/arrow-circle-left.svg",
    href: "/fake-artist/local",
  },
];

const url = "/fake-artist/fake-artist-rules.pdf";

export default function Rules() {
  return (
    <>
      <Navbar title="Fake Artist Rules" />
      <div className="main"></div>
      <Footer />
    </>
  );
}
