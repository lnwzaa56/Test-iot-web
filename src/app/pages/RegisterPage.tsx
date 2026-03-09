import { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { toast } from "sonner";
import { Mail, Lock, User, UserPlus } from "lucide-react";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (password !== confirmPassword) {
      toast.error("รหัสผ่านไม่ตรงกัน", {
        description: "กรุณาตรวจสอบรหัสผ่านอีกครั้ง",
      });
      return;
    }

    if (password.length < 6) {
      toast.error("รหัสผ่านสั้นเกินไป", {
        description: "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร",
      });
      return;
    }

    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      const users = JSON.parse(localStorage.getItem("users") || "[]");
      
      // Check if email already exists
      if (users.some((u: any) => u.email === email)) {
        toast.error("อีเมลนี้ถูกใช้งานแล้ว", {
          description: "กรุณาใช้อีเมลอื่น",
        });
        setIsLoading(false);
        return;
      }

      const newUser = { name, email, password };
      users.push(newUser);
      localStorage.setItem("users", JSON.stringify(users));

      toast.success("สมัครสมาชิกสำเร็จ!", {
        description: "คุณสามารถเข้าสู่ระบบได้เลย",
      });
      navigate("/");
      setIsLoading(false);
    }, 1000);
  };



  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-100 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-3xl text-center">ลงทะเบียน</CardTitle>
          <CardDescription className="text-center">
            สร้างบัญชีใหม่เพื่อเริ่มต้นใช้งาน
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">ชื่อ</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="name"
                  type="text"
                  placeholder="ชื่อของคุณ"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
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
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">ยืนยันรหัสผ่าน</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>กำลังลงทะเบียน...</>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  ลงทะเบียน
                </>
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-sm text-center text-gray-600">
            มีบัญชีอยู่แล้ว?{" "}
            <button
              onClick={() => navigate("/")}
              className="text-purple-600 hover:underline font-medium"
            >
              เข้าสู่ระบบที่นี่
            </button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
