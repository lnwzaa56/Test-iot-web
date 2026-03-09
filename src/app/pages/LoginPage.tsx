import { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { toast } from "sonner";
import { Mail, Lock, LogIn } from "lucide-react";

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      const users = JSON.parse(localStorage.getItem("users") || "[]");
      const user = users.find((u: any) => u.email === email && u.password === password);

      if (user) {
        localStorage.setItem("currentUser", JSON.stringify(user));
        toast.success("เข้าสู่ระบบสำเร็จ!", {
          description: `ยินดีต้อนรับ ${user.name}`,
        });
        // You can navigate to dashboard or home page here
        navigate("/dashboard");
      } else {
        toast.error("เข้าสู่ระบบไม่สำเร็จ", {
          description: "อีเมลหรือรหัสผ่านไม่ถูกต้อง",
        });
      }
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-3xl text-center">เข้าสู่ระบบ</CardTitle>
          <CardDescription className="text-center">
            กรอกอีเมลและรหัสผ่านเพื่อเข้าสู่ระบบ
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">อีเมล</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="example@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">รหัสผ่าน</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>กำลังเข้าสู่ระบบ...</>
              ) : (
                <>
                  <LogIn className="mr-2 h-4 w-4" />
                  เข้าสู่ระบบ
                </>
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-sm text-center text-gray-600">
            ยังไม่มีบัญชี?{" "}
            <button
              onClick={() => navigate("/register")}
              className="text-blue-600 hover:underline font-medium"
            >
              ลงทะเบียนที่นี่
            </button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
