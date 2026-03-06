"use client";

import { getDevices } from "@/services/tool-data";
import { useEffect, useState } from "react";

export function useDevices() {
    const [devices, setDevices] = useState<Device[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loaded, setLoaded] = useState(false); // 🔑 chốt

    useEffect(() => {
        if (loaded) return;

        setLoading(true);
        getDevices()
            .then(setDevices)
            .catch((e) => setError(e.message))
            .finally(() => {
                setLoading(false);
                setLoaded(true);
            });
    }, [loaded]);

    return { devices, loading, error };
}

export interface Device {
    name: string; // deviceId từ adb
}