import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Hero from "./components/Hero";

export default async function Home() {

  return <>
    <Navbar title="Party Paper Pen" />
    <Hero />
    <Footer />
  </>;
}
