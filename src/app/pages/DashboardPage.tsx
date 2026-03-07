import React, { useEffect, useState } from "react";
import { ref, onValue, set, update } from "firebase/database";
import { db } from "../../firebase";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebase";
import { useNavigate } from "react-router-dom";
import { 
  Package, 
  Lock, 
  Unlock, 
  DoorClosed, 
  DoorOpen, 
  Scale, 
  AlertTriangle, 
  Camera, 
  Bell,
  BellOff,
  Wifi, 
  WifiOff,
  LogOut,
  Box,
  Settings
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Slider } from "../components/ui/slider";
import { Switch } from "../components/ui/switch";

interface SmartBoxData {
  buzzer: {
    enabled: boolean;
  };
  camera: {
    captureCommand: boolean;
  };
  device: {
    deviceId: string;
    firmwareVersion: string;
    lastOnline: number;
    status: string;
  };
  door: {
    lastOpenedTime: number;
    status: string;
  };
  lock: {
    command: string;
    status: boolean;
  };
  logs: {
    [key: string]: {
      timestamp: number;
      type: string;
    };
  };
  parcel: {
    count: number;
    lastDetectedTime: number;
  };
  weight: {
    lastUpdated: number;
    maxLimitKg: number;
    overLimit: boolean;
    totalKg: number;
  };
}

const DashboardPage: React.FC = () => {
  const [smartBoxData, setSmartBoxData] = useState<SmartBoxData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [maxLimit, setMaxLimit] = useState<number>(20);
  const [buzzerEnabled, setBuzzerEnabled] = useState<boolean>(false);
  const [lockLoading, setLockLoading] = useState(false);
  const [buzzerLoading, setBuzzerLoading] = useState(false);
  const [weightLoading, setWeightLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate("/");
      }
    });

    const smartboxRef = ref(db, "smartbox");
    const unsubscribe = onValue(
      smartboxRef,
      (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setSmartBoxData(data);
          setMaxLimit(data.weight?.maxLimitKg || 20);
          setBuzzerEnabled(data.buzzer?.enabled || false);
        } else {
          setSmartBoxData(null);
        }
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching smartbox data:", err);
        setError("Failed to load smartbox data.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const handleLockToggle = async () => {
    if (!smartBoxData) return;
    setLockLoading(true);
    try {
      const newStatus = !smartBoxData.lock.status;
      await update(ref(db, "smartbox/lock"), {
        status: newStatus,
        command: "toggle"
      });
    } catch (err) {
      console.error("Failed to toggle lock:", err);
    }
    setLockLoading(false);
  };

  const handleBuzzerToggle = async (enabled: boolean) => {
    setBuzzerLoading(true);
    try {
      await update(ref(db, "smartbox/buzzer"), {
        enabled: enabled
      });
      setBuzzerEnabled(enabled);
    } catch (err) {
      console.error("Failed to toggle buzzer:", err);
    }
    setBuzzerLoading(false);
  };

  const handleMaxLimitChange = async (value: number[]) => {
    const newLimit = value[0];
    setMaxLimit(newLimit);
    try {
      await update(ref(db, "smartbox/weight"), {
        maxLimitKg: newLimit
      });
    } catch (err) {
      console.error("Failed to update max limit:", err);
    }
  };

  const formatDate = (timestamp: number) => {
    if (!timestamp || timestamp === 0) return "Never";
    return new Date(timestamp).toLocaleString();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="pt-6">
            <div className="text-center text-red-500">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4" />
              <p>{error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!smartBoxData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="pt-6">
            <div className="text-center text-gray-500">
              <Package className="h-12 w-12 mx-auto mb-4" />
              <p>No smartbox data available.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isOnline = smartBoxData.device.status === "online";
  const isDoorOpen = smartBoxData.door.status === "open";
  const isLocked = smartBoxData.lock.status;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-950">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Box className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
              Smart Package Guard
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              {isOnline ? (
                <Wifi className="h-5 w-5 text-green-500" />
              ) : (
                <WifiOff className="h-5 w-5 text-red-500" />
              )}
              <span className={`text-sm font-medium ${isOnline ? 'text-green-600' : 'text-red-600'}`}>
                {isOnline ? 'Online' : 'Offline'}
              </span>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Status Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Device Status */}
          <Card className="bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 flex items-center">
                <Wifi className="h-4 w-4 mr-2" />
                Device Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <span className={`h-3 w-3 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></span>
                <span className="text-2xl font-bold capitalize">{smartBoxData.device.status}</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">ID: {smartBoxData.device.deviceId}</p>
            </CardContent>
          </Card>

          {/* Lock Status with Toggle */}
          <Card className="bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 flex items-center">
                {isLocked ? <Lock className="h-4 w-4 mr-2" /> : <Unlock className="h-4 w-4 mr-2" />}
                Lock Control
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center space-y-3">
                <div className="flex items-center space-x-2">
                  {isLocked ? <Lock className="h-6 w-6 text-red-500" /> : <Unlock className="h-6 w-6 text-green-500" />}
                  <span className="text-2xl font-bold">{isLocked ? "Locked" : "Unlocked"}</span>
                </div>
                <Button 
                  onClick={handleLockToggle} 
                  disabled={lockLoading}
                  variant={isLocked ? "outline" : "default"}
                  className="w-full"
                >
                  {lockLoading ? "Loading..." : isLocked ? "Unlock" : "Lock"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Door Status */}
          <Card className="bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 flex items-center">
                {isDoorOpen ? <DoorOpen className="h-4 w-4 mr-2" /> : <DoorClosed className="h-4 w-4 mr-2" />}
                Door Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                {isDoorOpen ? <DoorOpen className="h-6 w-6 text-orange-500" /> : <DoorClosed className="h-6 w-6 text-green-500" />}
                <span className="text-2xl font-bold capitalize">{smartBoxData.door.status}</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Last opened: {formatDate(smartBoxData.door.lastOpenedTime)}</p>
            </CardContent>
          </Card>

          {/* Parcel Count */}
          <Card className="bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 flex items-center">
                <Package className="h-4 w-4 mr-2" />
                Parcels
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <Package className="h-6 w-6 text-blue-500" />
                <span className="text-2xl font-bold">{smartBoxData.parcel.count}</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Last detected: {formatDate(smartBoxData.parcel.lastDetectedTime)}</p>
            </CardContent>
          </Card>
        </div>

        {/* Controls and Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Weight Card with Slider */}
          <Card className="bg-white dark:bg-gray-800 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Scale className="h-5 w-5 mr-2 text-purple-500" />
                Weight Monitor
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Current Weight</span>
                  <span className="text-2xl font-bold">{smartBoxData.weight.totalKg} kg</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                  <div 
                    className={`h-2.5 rounded-full ${smartBoxData.weight.overLimit ? 'bg-red-500' : 'bg-blue-600'}`} 
                    style={{ width: `${Math.min((smartBoxData.weight.totalKg / maxLimit) * 100, 100)}%` }}
                  ></div>
                </div>
                
                {/* Max Limit Slider */}
                <div className="space-y-2 pt-2 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500 flex items-center">
                      <Settings className="h-3 w-3 mr-1" />
                      Max Limit
                    </span>
                    <span className="font-medium">{maxLimit} kg</span>
                  </div>
                  <Slider
                    value={[maxLimit]}
                    onValueChange={handleMaxLimitChange}
                    max={100}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <AlertTriangle className={`h-4 w-4 ${smartBoxData.weight.overLimit ? 'text-red-500' : 'text-green-500'}`} />
                  <span className={smartBoxData.weight.overLimit ? 'text-red-500 font-medium' : 'text-green-500 font-medium'}>
                    {smartBoxData.weight.overLimit ? 'Over Limit!' : 'Within Limit'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Buzzer Control Card */}
          <Card className="bg-white dark:bg-gray-800 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="h-5 w-5 mr-2 text-yellow-500" />
                Buzzer Control
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {buzzerEnabled ? (
                    <Bell className="h-8 w-8 text-yellow-500" />
                  ) : (
                    <BellOff className="h-8 w-8 text-gray-400" />
                  )}
                  <div>
                    <p className="font-medium">{buzzerEnabled ? "Buzzer Active" : "Buzzer Disabled"}</p>
                    <p className="text-sm text-gray-500">Toggle to enable/disable</p>
                  </div>
                </div>
                <Switch
                  checked={buzzerEnabled}
                  onCheckedChange={handleBuzzerToggle}
                  disabled={buzzerLoading}
                />
              </div>
            </CardContent>
          </Card>

          {/* Camera Card */}
          <Card className="bg-white dark:bg-gray-800 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Camera className="h-5 w-5 mr-2 text-indigo-500" />
                Camera
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Capture Command</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${smartBoxData.camera.captureCommand ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>
                  {smartBoxData.camera.captureCommand ? 'Active' : 'Inactive'}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Device Info Card */}
          <Card className="bg-white dark:bg-gray-800 shadow-md md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Box className="h-5 w-5 mr-2 text-blue-500" />
                Device Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Device ID</p>
                  <p className="font-medium">{smartBoxData.device.deviceId}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Firmware Version</p>
                  <p className="font-medium">{smartBoxData.device.firmwareVersion}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Last Online</p>
                  <p className="font-medium">{formatDate(smartBoxData.device.lastOnline)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <p className="font-medium capitalize">{smartBoxData.device.status}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Event Logs Card */}
          <Card className="bg-white dark:bg-gray-800 shadow-md">
            <CardHeader>
              <CardTitle>Event Logs</CardTitle>
            </CardHeader>
            <CardContent>
              {Object.keys(smartBoxData.logs).length > 0 ? (
                <ul className="space-y-2 max-h-48 overflow-y-auto">
                  {Object.entries(smartBoxData.logs).map(([key, log]) => (
                    <li key={key} className="flex justify-between items-center text-sm border-b pb-2 last:border-0">
                      <span className="font-medium capitalize">{log.type.replace(/_/g, ' ')}</span>
                      <span className="text-gray-500 text-xs">{formatDate(log.timestamp)}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 text-sm">No event logs available.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
