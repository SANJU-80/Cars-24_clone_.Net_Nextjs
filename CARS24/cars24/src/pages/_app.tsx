import Fotter from "@/components/Fotter";
import Header from "@/components/Header";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/context/AuthContext";
import { NotificationProvider } from "@/context/NotificationContext";
import "@/styles/globals.css";
import type { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Header />
        <Component {...pageProps} />
        <Fotter />
        <Toaster richColors />
      </NotificationProvider>
    </AuthProvider>
  );
}
