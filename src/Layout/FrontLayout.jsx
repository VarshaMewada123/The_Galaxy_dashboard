import { Outlet } from "react-router-dom";
import Header from "../Common/Header";
import { Footer } from "../Common/Footer";

const Layout = () => {
  return (
    <>
      <Header />
      <main className="pt-20 min-h-screen">
        <Outlet />
      </main>
      <Footer />
    </>
  );
};

export default Layout;
