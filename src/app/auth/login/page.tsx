"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, TrendingUp, Loader2 } from "lucide-react";
import { useAuthStore } from "@/lib/store/auth";
import Link from "next/link";

const schema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Ingresá tu contraseña"),
  totpCode: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const [showPassword, setShowPassword] = useState(false);
  const [requires2fa, setRequires2fa] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setError("");
    setLoading(true);
    try {
      const result = await login(data.email, data.password, data.totpCode);
      if (result.requires2fa) {
        setRequires2fa(true);
        setLoading(false);
        return;
      }
      router.push("/dashboard");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setError(msg || "Error al iniciar sesión");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0E17] flex items-center justify-center px-4">
      {/* Gradient glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-arbi-green/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-arbi-green/3 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-arbi-green rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-black" />
            </div>
            <span className="text-xl font-bold text-white">Orbix</span>
          </div>
          <p className="text-muted-foreground text-sm">
            {requires2fa ? "Verificación en dos pasos" : "Iniciá sesión en tu cuenta"}
          </p>
        </div>

        {/* Card */}
        <div className="bg-[#161B27] border border-[#1E2534] rounded-xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {!requires2fa ? (
              <>
                {/* Email */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Email</label>
                  <input
                    {...register("email")}
                    type="email"
                    placeholder="tu@email.com"
                    autoComplete="email"
                    className="w-full bg-[#0F1117] border border-[#1E2534] rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-arbi-green focus:border-arbi-green transition-colors"
                  />
                  {errors.email && (
                    <p className="text-xs text-arbi-red">{errors.email.message}</p>
                  )}
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Contraseña</label>
                  <div className="relative">
                    <input
                      {...register("password")}
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      autoComplete="current-password"
                      className="w-full bg-[#0F1117] border border-[#1E2534] rounded-lg px-4 py-2.5 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-arbi-green focus:border-arbi-green transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-xs text-arbi-red">{errors.password.message}</p>
                  )}
                </div>
              </>
            ) : (
              /* 2FA Input */
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">
                  Código de autenticador (6 dígitos)
                </label>
                <input
                  {...register("totpCode")}
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="000000"
                  autoFocus
                  className="w-full bg-[#0F1117] border border-[#1E2534] rounded-lg px-4 py-2.5 text-sm text-center font-mono tracking-[0.5em] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-arbi-green focus:border-arbi-green transition-colors"
                />
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="bg-arbi-red-dim border border-arbi-red/20 rounded-lg px-4 py-2.5">
                <p className="text-xs text-arbi-red">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-arbi-green hover:bg-arbi-green/90 disabled:opacity-50 disabled:cursor-not-allowed text-black font-semibold rounded-lg px-4 py-2.5 text-sm transition-colors flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {requires2fa ? "Verificar" : "Ingresar"}
            </button>
          </form>

          {!requires2fa && (
            <p className="text-center text-sm text-muted-foreground mt-6">
              ¿No tenés cuenta?{" "}
              <Link href="/auth/register" className="text-arbi-green hover:underline">
                Registrate
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
