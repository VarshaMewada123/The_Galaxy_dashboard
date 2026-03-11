import { memo, Suspense } from "react";
import { Outlet } from "react-router-dom";
import Header from "../Common/Header";
import { Footer } from "../Common/Footer";

const Layout = memo(() => {
  return (
    <div className="relative flex min-h-[100dvh] w-full flex-col overflow-x-hidden bg-white selection:bg-neutral-900 selection:text-white">
      <Header />

      <main
        id="main-content"
        role="main"
        className="relative flex flex-1 flex-col w-full"
      >
        <div className="mx-auto w-full max-w-[1920px] px-4 sm:px-6 lg:px-8">
          <Suspense
            fallback={
              <div className="flex h-96 w-full items-center justify-center">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-neutral-200 border-t-neutral-900" />
              </div>
            }
          >
            <Outlet />
          </Suspense>
        </div>
      </main>

      <Footer />
    </div>
  );
});

export default Layout;
