import { api2 } from "@/lib/axios"; // chỉ dùng api2

export interface Device {
    name: string;
}

/**
 * Lấy danh sách thiết bị
 * Backend trả về: string[]
 */
export const getDevices = async (): Promise<Device[]> => {
    const res = await api2.get<string[]>("/device/devices");

    if (!Array.isArray(res.data)) {
        console.error("API /device/devices trả về sai format:", res.data);
        return [];
    }

    return res.data.map((name) => ({
        name: String(name),
    }));
};

/**
 * Bật / tắt wifi cho 1 device
 */
export const toggleWifi = async (
    device: string,
    state: "on" | "off"
) => {
    if (!device) return;

    return api2.post(`/device/${encodeURIComponent(device)}/wifi`, {
        state,
    });
};

/**
 * Bật wifi cho tất cả
 */
export const wifiAllOn = async () => {
    return api2.post("/device/wifi/all/on");
};

/**
 * Mở Youtube cho tất cả
 */
export const watchYoutubeAll = async (channelUrl: string) => {
    if (!channelUrl) return;

    return api2.post("/device/youtube/all/watch", {
        channelUrl,
    });
};

/**
 * Đóng app cho tất cả
 */
export const closeAppAll = async (packageName: string) => {
    if (!packageName) return;

    return api2.post("/device/app/close", {
        package: packageName,
    });
};

/**
 * Chat Zalo tất cả
 */
export const chatZaloAll = async (
    group: string,
    message: string
) => {
    if (!group || !message) return;

    return api2.post("/device/zalo/chat/all", {
        group,
        message,
    });
};
