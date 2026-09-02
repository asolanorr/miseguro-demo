import type { LoginInput, RegisterInput } from "@/features/auth/auth.schema";

export async function loginUser(_input: LoginInput) {
  return { ok: true, message: "Login mocked" };
}

export async function registerUser(_input: RegisterInput) {
  return { ok: true, message: "Register mocked" };
}
