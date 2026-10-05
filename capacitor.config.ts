import type { CapacitorConfig } from "@capacitor/cli";

/**
 * SISE native shell. The app loads the live site (server.url), so every web release reaches the app immediately.
 * appId must be your own reverse-domain id and can never change after the first store upload — confirm it before `npx cap add`.
 */
const config: CapacitorConfig = {
  appId: "app.sisely.sise",
  appName: "SISE",
  webDir: "mobile-www",
  server: {
    url: "https://sisely.vercel.app",
    cleartext: false,
    allowNavigation: ["sisely.vercel.app", "access.line.me", "*.line.me", "*.line-scdn.net"],
  },
  ios: { contentInset: "never", backgroundColor: "#f7f6fb" },
  android: { backgroundColor: "#f7f6fb" },
  plugins: {
    SplashScreen: { launchShowDuration: 900, backgroundColor: "#0d0b24", showSpinner: false },
    StatusBar: { style: "DEFAULT" },
  },
};

export default config;
