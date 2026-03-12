import React, { useEffect, useState } from "react";
import { ref, onValue, remove } from "firebase/database";
import { db } from "../../firebase";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Calendar, 
  Image as ImageIcon,
  Clock,
  Trash2
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";

interface HistoryItem {
  id: string;
  imageUrl: string;
  timestamp: number;
}

const HistoryPage: React.FC = () => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const historyRef = ref(db, "smartbox/camera_history");
    const unsubscribe = onValue(historyRef, (snapshot: any) => {
      const data = snapshot.val();
      if (data) {
        const items: HistoryItem[] = Object.entries(data).map(([key, value]: [string, any]) => ({
          id: key,
          ...value
        }));
        // Sort by timestamp descending
        items.sort((a, b) => b.timestamp - a.timestamp);
        setHistory(items);
      } else {
        setHistory([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('th-TH');
  };

  const handleClearLogs = async () => {
    if (window.confirm("คุณแน่ใจหรือไม่ว่าต้องการลบรูปภาพประวัติทั้งหมด?")) {
      try {
        await remove(ref(db, "smartbox/camera_history"));
        alert("ลบประวัติทั้งหมดเรียบร้อยแล้ว");
      } catch (err) {
        console.error("Failed to clear logs:", err);
        alert("เกิดข้อผิดพลาดในการลบข้อมูล");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-950 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white flex items-center">
              <ImageIcon className="mr-3 h-8 w-8 text-blue-500" />
              Camera History
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-500 hidden md:block">
              Total {history.length} images
            </div>
            {history.length > 0 && (
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={handleClearLogs}
                className="flex items-center"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear All
              </Button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600">Loading history...</p>
          </div>
        ) : history.length === 0 ? (
          <Card className="text-center py-20">
            <CardContent>
              <ImageIcon className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500 text-lg">No image history found.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {history.map((item: HistoryItem) => (
              <Card key={item.id} className="overflow-hidden bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow group">
                <div className="aspect-video relative overflow-hidden bg-gray-100">
                  <img 
                    src={item.imageUrl} 
                    alt={`Capture ${item.id}`} 
                    className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm text-white px-2 py-1 rounded text-xs flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {new Date(item.timestamp).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                <CardContent className="p-4">
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <Calendar className="h-4 w-4 mr-2 text-blue-500" />
                    {formatDate(item.timestamp)}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryPage;
