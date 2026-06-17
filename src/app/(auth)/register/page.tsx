"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import toast from "react-hot-toast";
import { Mail, Lock, User, Eye, EyeOff, AtSign } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function setField(key: string, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: "" }));
  }

  function validate(): boolean {
    const errs: typeof errors = {};
    if (!form.name.trim()) errs.name = "Display name is required";
    if (!form.username.trim()) errs.username = "Username is required";
    else if (!/^[a-zA-Z0-9_]{3,20}$/.test(form.username))
      errs.username = "3–20 characters, letters, numbers, underscores only";
    if (!form.email) errs.email = "Email is required";
    if (!form.password) errs.password = "Password is required";
    else if (form.password.length < 8)
      errs.password = "At least 8 characters";
    if (form.password !== form.confirmPassword)
      errs.confirmPassword = "Passwords don't match";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate() || loading) return;
    setLoading(true);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          username: form.username.trim().toLowerCase(),
          email: form.email.trim().toLowerCase(),
          password: form.password,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.field) {
          setErrors({ [data.field]: data.error });
        } else {
          toast.error(data.error || "Registration failed");
        }
        return;
      }

      const result = await signIn("credentials", {
        email: form.email.trim().toLowerCase(),
        password: form.password,
        redirect: false,
      });

      if (result?.ok) {
        toast.success("Account created! Welcome to Tickr.");
        router.push("/");
        router.refresh();
      } else {
        router.push("/login");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-white mb-2">Create account</h1>
        <p className="text-sm text-zinc-500">Join the trading community</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Display name"
          placeholder="Alex Chen"
          value={form.name}
          onChange={(e) => setField("name", e.target.value)}
          error={errors.name}
          leftIcon={<User className="w-4 h-4" />}
          autoComplete="name"
          autoFocus
        />
        <Input
          label="Username"
          placeholder="traderpro"
          value={form.username}
          onChange={(e) => setField("username", e.target.value)}
          error={errors.username}
          leftIcon={<AtSign className="w-4 h-4" />}
          autoComplete="username"
        />
        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          value={form.email}
          onChange={(e) => setField("email", e.target.value)}
          error={errors.email}
          leftIcon={<Mail className="w-4 h-4" />}
          autoComplete="email"
        />
        <Input
          label="Password"
          type={showPassword ? "text" : "password"}
          placeholder="Min 8 characters"
          value={form.password}
          onChange={(e) => setField("password", e.target.value)}
          error={errors.password}
          leftIcon={<Lock className="w-4 h-4" />}
          rightElement={
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          }
          autoComplete="new-password"
        />
        <Input
          label="Confirm password"
          type="password"
          placeholder="Repeat password"
          value={form.confirmPassword}
          onChange={(e) => setField("confirmPassword", e.target.value)}
          error={errors.confirmPassword}
          leftIcon={<Lock className="w-4 h-4" />}
          autoComplete="new-password"
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={loading}
          className="w-full"
        >
          Create account
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-zinc-600">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-indigo-400 hover:text-indigo-300 transition-colors font-medium"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
