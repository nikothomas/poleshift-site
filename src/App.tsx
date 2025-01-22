import { Suspense, lazy, useEffect, useState, type ReactElement } from "react";
import { Typewriter } from "@/components/ui/typewriter";
import { Button } from "@/components/ui/button"; // Adjust path to your shadcn/ui button
import "./App.css";
const DMG = new URL(
    "https://releases.poleshift.cloud/poleshift_0.1.9_aarch64.dmg",
    import.meta.url
).href;
const AppImage = new URL(
    "https://releases.poleshift.cloud/poleshift_0.1.9_amd64.AppImage",
    import.meta.url
).href;
const NSIS = new URL(
    "https://releases.poleshift.cloud/poleshift_0-1.1.9_x64-setup.exe",
    import.meta.url
).href;

// 1. Import icons for Windows, Mac, and Linux
import { FaWindows, FaApple, FaLinux } from "react-icons/fa";

// Lazy load the globe
const GlobeComponent = lazy(() => import("@/components/Globe.tsx"));

// Page metadata
export function meta() {
    return [
        { title: "Poleshift" },
        {
            name: "description",
            content: "Our scientific data management platform is launching soon.",
        },
    ];
}

// 2. Define your Platform type with a union of IDs
type PlatformId = "windows" | "mac" | "linux";

interface Platform {
    id: PlatformId;
    label: string;
    link: string;
}

const texts = [" elegant", " intuitive", " fun", " your data"];

// Utility to detect user OS
function getUserPlatform(): PlatformId {
    if (typeof window === "undefined") {
        // Fallback for SSR if needed
        return "linux";
    }

    const userAgent = window.navigator.userAgent;
    if (userAgent.includes("Win")) {
        return "windows";
    } else if (userAgent.includes("Mac")) {
        return "mac";
    } else if (userAgent.includes("Linux")) {
        return "linux";
    }
    // Default to Linux if undetected
    return "linux";
}

export default function App() {
    // 3. Track both the detected platform and the ordered list with proper types
    const [detectedPlatform, setDetectedPlatform] = useState<PlatformId>("linux");
    const [platformsInOrder, setPlatformsInOrder] = useState<Platform[]>([]);

    // Define your download platforms
    const platforms: Platform[] = [
        { id: "windows", label: "Download for Windows", link: NSIS },
        { id: "mac", label: "Download for Mac", link: DMG },
        { id: "linux", label: "Download for Linux", link: AppImage },
    ];

    // Icons for each platform
    const platformIcons: Record<PlatformId, ReactElement> = {
        windows: <FaWindows />,
        mac: <FaApple />,
        linux: <FaLinux />,
    };

    // On mount, detect user platform and reorder
    useEffect(() => {
        const userPlatform = getUserPlatform();
        setDetectedPlatform(userPlatform);

        const primaryPlatform =
            platforms.find((p) => p.id === userPlatform) ?? platforms[2];
        const rest = platforms.filter((p) => p.id !== primaryPlatform.id);
        setPlatformsInOrder([primaryPlatform, ...rest]);
    }, []);

    // Helper to capitalize a platform id ("windows" -> "Windows")
    function capitalizePlatformId(platformId: string) {
        return platformId.charAt(0).toUpperCase() + platformId.slice(1);
    }

    return (
        <main className="relative h-screen w-screen overflow-auto bg-background text-foreground">
            {/*
        Use a responsive grid to prevent overflow on smaller screens.
        Adding overflow-hidden here ensures no horizontal scroll occurs.
      */}
            <section className="relative z-10 grid h-screen grid-cols-1 md:grid-cols-2 items-center justify-items-center overflow-hidden">
                {/* Left Column: Text */}
                <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto px-4 pb-10">
                    <p className="font-mono text-3xl font-semibold">Poleshift data is</p>
                    <p className="mt-2 text-sm font-semibold text-base-900">
                        <Typewriter texts={texts} delay={0.5} baseText="" />
                    </p>

                    {/* Buttons */}
                    {platformsInOrder.length > 0 && (
                        <div className="m-16 flex flex-col items-center justify-items-center gap-3">
                            {/* 1) Primary platform button */}
                            <Button
                                key={platformsInOrder[0].id}
                                variant="default"
                                asChild
                                // Conditionally enlarge the user's detected platform button
                                className={
                                    platformsInOrder[0].id === detectedPlatform ? "scale-125" : ""
                                }
                            >
                                <a
                                    href={platformsInOrder[0].link}
                                    className="flex items-center gap-2"
                                >
                                    {platformIcons[platformsInOrder[0].id]}
                                    {platformsInOrder[0].label}
                                </a>
                            </Button>

                            {/* 2) Secondary platforms side-by-side, same width */}
                            <div className="flex gap-2">
                                {platformsInOrder.slice(1).map((p) => (
                                    <Button key={p.id} variant="default" asChild className="flex-1">
                                        <a href={p.link} className="flex gap-2">
                                            {platformIcons[p.id]}
                                            {capitalizePlatformId(p.id)}
                                        </a>
                                    </Button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column: Globe */}
                {/* Remove negative z-index and let it simply fill the second column */}
                <div className="flex items-center justify-center w-full h-full">
                    <Suspense fallback={<p>Loading...</p>}>
                        <GlobeComponent />
                    </Suspense>
                </div>
            </section>

            {/* Footer */}
            <footer
                className="
          fixed
          bottom-0
          w-full
          text-xs
          text-center
          p-2
          z-30
        "
            >
                &copy; {new Date().getFullYear()} IcarAI LLC. All rights reserved.&nbsp;
                <a
                    href="https://icarai.io"
                    className="text-fuchsia-600 hover:underline"
                    target="_blank"
                    rel="noreferrer"
                >
                    icarai.io
                </a>
            </footer>
        </main>
    );
}
