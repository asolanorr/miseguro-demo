"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { registerSchema, type RegisterInput } from "@/features/auth/auth.schema";

export function RegisterForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterInput) => {
    console.log("register", data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="space-y-2">
        <label htmlFor="name" className="text-sm font-medium text-foreground">
          Nombre
        </label>
        <input
          id="name"
          type="text"
          className="h-11 w-full rounded-xl border border-border bg-background px-3 text-foreground outline-none ring-0 transition focus:border-primary"
          {...register("name")}
        />
        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
      </div>

      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium text-foreground">
          Correo electrónico
        </label>
        <input
          id="email"
          type="email"
          className="h-11 w-full rounded-xl border border-border bg-background px-3 text-foreground outline-none ring-0 transition focus:border-primary"
          {...register("email")}
        />
        {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-medium text-foreground">
          Contraseña
        </label>
        <input
          id="password"
          type="password"
          className="h-11 w-full rounded-xl border border-border bg-background px-3 text-foreground outline-none ring-0 transition focus:border-primary"
          {...register("password")}
        />
        {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="flex h-11 w-full items-center justify-center rounded-xl bg-primary px-4 font-medium text-primary-foreground transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Cargando..." : "Crear cuenta"}
      </button>
    </form>
  );
}
