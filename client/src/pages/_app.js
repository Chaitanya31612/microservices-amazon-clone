import { UserProvider } from "@/context/UserContext";
import "@/styles/globals.css";

export default function App({ Component, pageProps }) {
  return (
    <UserProvider>
      <Component {...pageProps} />
    </UserProvider>
  );
}
