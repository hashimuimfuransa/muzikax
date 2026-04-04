// Note: This is a server component that imports the client component
// The "use client" directive has been moved to HomeClient.tsx
import HomeClient from "../components/home/HomeClient";

export default function Home() {
  return <HomeClient />;
}
