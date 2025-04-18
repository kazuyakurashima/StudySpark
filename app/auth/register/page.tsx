'use client';

import { LoginForm } from "@/components/auth/login-form"

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50 p-4">
      <LoginForm isRegisterMode={true} />
    </div>
  );
} 