// src/components/GlobalLoader.jsx
import { useEffect } from "react";
import { BookOpen } from "lucide-react";

export default function GlobalLoader() {
    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = "";
        };
    }, []);

    return (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white">
            <div className="flex flex-col items-center gap-4">
                <div className="relative">
                    <div className="absolute inset-0 animate-ping rounded-full bg-blue-600/20" />
                    <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-blue-600">
                        <BookOpen size={32} className="text-white" />
                    </div>
                </div>
               
                <div className="mt-6 flex gap-2">
                    <div className="h-2.5 w-2.5 animate-bounce rounded-full bg-blue-600 [animation-delay:0ms]" />
                    <div className="h-2.5 w-2.5 animate-bounce rounded-full bg-blue-600 [animation-delay:150ms]" />
                    <div className="h-2.5 w-2.5 animate-bounce rounded-full bg-blue-600 [animation-delay:300ms]" />
                </div>
            </div>
        </div>
    );
}