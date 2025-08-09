import "./globals.css";
import { WalletProvider } from "./providers/wallet-provider";

export const metadata = {
  title: "PSNChain Wallet",
  description: "PSNChain Blockchain Wallet Interface",
  icons: {
    icon: '/psn.png',
    shortcut: '/psn.png',
    apple: '/psn.png',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <WalletProvider>
          {children}
        </WalletProvider>
      </body>
    </html>
  );
}
