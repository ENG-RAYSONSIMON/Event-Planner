import { SubmitHandler, useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { FiUserPlus } from "react-icons/fi";
import { useState } from "react";
import { api } from "../services/api";
import { toErrorMessage } from "../services/http";

interface RegisterFormValues {
  fullName: string;
  email: string;
  password: string;
}

export const RegisterPage = () => {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<RegisterFormValues>();

  const onSubmit: SubmitHandler<RegisterFormValues> = async (values) => {
    try {
      setServerError(null);
      await api.register(values.fullName, values.email, values.password);
      navigate("/login");
    } catch (error) {
      setServerError(toErrorMessage(error));
    }
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md items-center px-4">
      <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-4 rounded-2xl bg-white p-6 shadow">
        <h1 className="text-xl font-semibold">Create account</h1>

        <label className="block text-sm">
          Full name
          <input
            className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2"
            {...register("fullName", { required: "Full name is required" })}
          />
          {errors.fullName ? <span className="text-xs text-red-600">{errors.fullName.message}</span> : null}
        </label>

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
            {...register("password", {
              required: "Password is required",
              minLength: { value: 6, message: "Minimum 6 characters" }
            })}
          />
          {errors.password ? <span className="text-xs text-red-600">{errors.password.message}</span> : null}
        </label>

        {serverError ? <p className="text-sm text-red-600">{serverError}</p> : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-2 font-medium text-white"
        >
          <FiUserPlus /> {isSubmitting ? "Creating..." : "Create account"}
        </button>

        <p className="text-sm text-slate-600">
          Already registered? <Link className="font-medium text-brand-700" to="/login">Sign in</Link>
        </p>
      </form>
    </main>
  );
};
