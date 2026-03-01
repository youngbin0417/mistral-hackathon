"use client";

import React, { useState, useEffect } from "react";

const catFrames = [
    "  ⡠⣒⠄  ⡔⢄⠔⡄\n ⢸⠸⣀⡔⢉⠱⣃⡢⣂⡣\n  ⠉⠒⠣⠤⠵⠤⠬⠮⠆",
    "  ⢠⣒⠄  ⡔⢄⠔⡄\n ⢸⠸⣀⡔⠚⠙⣃⠚⠙⣣\n  ⠉⠒⠣⠤⠵⠤⠬⠮⠆",
    "  ⡠⣒⠄  ⠢⢄⠔⡄\n ⢸⠸⣀⡔⢊⠜⣃⢊⠜⣣\n  ⠉⠒⠣⠤⠵⠤⠬⠮⠆",
    "  ⡠⣒⠄  ⡔⢄⠔⡄\n ⢸⠸⣀⡔⢉⠱⣃⡢⣂⡣\n  ⠉⠒⠣⠤⠵⠤⠬⠮⠆",
];

export default function MistralCat({
    className = "",
    size = "large"
}: {
    className?: string,
    size?: "small" | "large"
}) {
    const iconSize = size === "large" ? 100 : 40;

    return (
        <div className={`relative flex items-center justify-center ${className}`}>
            <img
                src="https://cms.mistral.ai/assets/920e56ee-25c5-439d-bd31-fbdf5c92c87f"
                alt="Mistral Cat"
                width={iconSize}
                height={iconSize}
                className="object-contain animate-float-gentle"
                style={{
                    filter: 'brightness(1.2) drop-shadow(0 0 12px rgba(253, 90, 30, 0.3))'
                }}
            />
            <div className="absolute -bottom-2 w-full h-1 bg-gradient-to-r from-transparent via-[#FD5A1E]/20 to-transparent blur-sm animate-pulse" />
        </div>
    );
}
