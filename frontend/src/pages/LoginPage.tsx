import { SubmitHandler, useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { FiLogIn } from "react-icons/fi";
import { useState } from "react";
import { api } from "../services/api";
import { toErrorMessage } from "../services/http";
import { useAuthStore } from "../store/authStore";

interface LoginFormValues {
  email: string;
  password: string;
}

export const LoginPage = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<LoginFormValues>();

  const onSubmit: SubmitHandler<LoginFormValues> = async (values) => {
    try {
      setServerError(null);
      const result = await api.login(values.email, values.password);
      setAuth(result.token, result.user);
      navigate("/");
    } catch (error) {
      setServerError(toErrorMessage(error));
    }
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md items-center px-4">
      <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-4 rounded-2xl bg-white p-6 shadow">
        <h1 className="text-xl font-semibold">Sign in</h1>
        <p className="text-sm text-slate-500">Access your events and invitations.</p>

        <label className="block text-sm">
          Email
          <input
            type="email"
            className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2"
            {...register("email", {
              required: "Email is required",
              pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Enter a valid email" }
            })}
          />
          {errors.email ? <span className="text-xs text-red-600">{errors.email.message}</span> : null}
        </label>

        <label className="block text-sm">
          Password
          <input
            type="password"
            className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2"
            {...register("password", { required: "Password is required" })}
          />
          {errors.password ? <span className="text-xs text-red-600">{errors.password.message}</span> : null}
        </label>

        {serverError ? <p className="text-sm text-red-600">{serverError}</p> : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-2 font-medium text-white"
        >
          <FiLogIn /> {isSubmitting ? "Signing in..." : "Sign in"}
        </button>

        <p className="text-sm text-slate-600">
          No account? <Link className="font-medium text-brand-700" to="/register">Create one</Link>
        </p>
      </form>
    </main>
  );
};
