"use client";

import * as React from "react";
import {
    getDevices,
    toggleWifi,
    wifiAllOn,
    watchYoutubeAll,
    closeAppAll,
    chatZaloAll,
    Device,
} from "../../services/tool-data";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import {
    IconWifi,
    IconWifiOff,
    IconRefresh,
    IconPlayerPlay,
    IconX,
    IconMessage,
    IconDeviceMobile,
    IconAlertCircle,
} from "@tabler/icons-react";

import { cn } from "@/lib/utils";

export function DeviceTable() {
    const [devices, setDevices] = React.useState<Device[]>([]);
    const [loading, setLoading] = React.useState(false);
    const [actionLoading, setActionLoading] = React.useState<string | null>(null);

    /**
     * Load danh sách device
     */
    const loadDevices = async () => {
        setLoading(true);
        try {
            const data = await getDevices();
            setDevices(data);
        } catch (err) {
            console.error("Load devices lỗi:", err);
            setDevices([]);
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        loadDevices();
    }, []);

    /**
     * Wrapper xử lý loading + lỗi
     */
    const handleAction = async (
        action: () => Promise<any>,
        deviceName?: string
    ) => {
        try {
            if (deviceName) setActionLoading(deviceName);
            await action();
        } catch (err) {
            console.error("Action lỗi:", err);
            alert("Thao tác thất bại, xem console!");
        } finally {
            if (deviceName) setActionLoading(null);
        }
    };

    const handleWifi = (device: string, state: "on" | "off") =>
        handleAction(() => toggleWifi(device, state), device);

    const handleWifiAll = () =>
        handleAction(wifiAllOn);

    const handleYoutubeAll = () =>
        handleAction(() =>
            watchYoutubeAll("https://www.youtube.com/@ThayTuanChuyenToan")
        );

    const handleCloseAppAll = () =>
        handleAction(() => closeAppAll("com.zing.zalo"));

    const handleChatZaloAll = () => {
        const group = prompt("Tên nhóm Zalo:");
        const message = prompt("Nội dung tin nhắn:");
        if (!group || !message) return;

        handleAction(() => chatZaloAll(group, message));
    };

    return (
        <div className="space-y-6">
            {/* ===== HEADER ===== */}
            <Card className="border-gray-200 shadow-sm">
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle className="text-2xl">
                                Quản lý Thiết bị
                            </CardTitle>
                            <CardDescription>
                                Điều khiển thiết bị Android qua ADB
                            </CardDescription>
                        </div>

                        <Button
                            onClick={loadDevices}
                            disabled={loading}
                        >
                            <IconRefresh
                                className={cn(
                                    "h-4 w-4 mr-2",
                                    loading && "animate-spin"
                                )}
                            />
                            Tải lại
                        </Button>
                    </div>
                </CardHeader>

                <CardContent className="flex gap-2 flex-wrap">
                    <Button variant="outline" onClick={handleWifiAll}>
                        <IconWifi className="h-4 w-4 mr-2" />
                        Bật WiFi tất cả
                    </Button>

                    <Button variant="outline" onClick={handleYoutubeAll}>
                        <IconPlayerPlay className="h-4 w-4 mr-2" />
                        YouTube tất cả
                    </Button>

                    <Button variant="outline" onClick={handleCloseAppAll}>
                        <IconX className="h-4 w-4 mr-2" />
                        Đóng Zalo
                    </Button>

                    <Button variant="outline" onClick={handleChatZaloAll}>
                        <IconMessage className="h-4 w-4 mr-2" />
                        Chat Zalo
                    </Button>
                </CardContent>
            </Card>

            {/* ===== TABLE ===== */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <IconDeviceMobile />
                        Danh sách thiết bị
                        <Badge>{devices.length}</Badge>
                    </CardTitle>
                </CardHeader>

                <CardContent>
                    {devices.length === 0 && !loading ? (
                        <div className="text-center py-10 text-gray-500">
                            <IconAlertCircle className="mx-auto mb-2" />
                            Không có thiết bị
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Thiết bị</TableHead>
                                    <TableHead>Trạng thái</TableHead>
                                    <TableHead className="text-right">
                                        Hành động
                                    </TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {devices.map((d) => (
                                    <TableRow key={d.name}>
                                        <TableCell>{d.name}</TableCell>

                                        <TableCell>
                                            <Badge variant="outline">
                                                Online
                                            </Badge>
                                        </TableCell>

                                        <TableCell className="text-right space-x-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                disabled={actionLoading === d.name}
                                                onClick={() =>
                                                    handleWifi(d.name, "on")
                                                }
                                            >
                                                <IconWifi className="h-4 w-4" />
                                            </Button>

                                            <Button
                                                size="sm"
                                                variant="outline"
                                                disabled={actionLoading === d.name}
                                                onClick={() =>
                                                    handleWifi(d.name, "off")
                                                }
                                            >
                                                <IconWifiOff className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
