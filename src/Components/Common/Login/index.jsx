import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAppDispatch } from "../../../store/hooks";
import { setAuth } from "../../../store/slices/auth.slice";
import { useLoginMutation } from "../../../store/services/auth.api";

const ALLOWED_ROLES = ["ADMIN", "SUPER_ADMIN"];

const PHONE_REGEX = /^\+?[0-9]{9,15}$/;

function getSafeErrorMessage(error) {
  if (error?.status === "FETCH_ERROR" || error?.status === "TIMEOUT_ERROR") {
    return "Tarmoq xatosi. Internet aloqangizni tekshirib qayta urinib ko‘ring.";
  }

  if (typeof error?.status === "number" && error.status >= 500) {
    return "Serverda xatolik yuz berdi. Birozdan so‘ng qayta urinib ko‘ring.";
  }

  if (error instanceof Error && error.message === "ROLE_NOT_ALLOWED") {
    return "Ushbu hisobda admin panelga kirish huquqi yo‘q.";
  }

  return "Telefon raqam yoki parol noto‘g‘ri.";
}

export default function Login() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState("");

  const [login, { isLoading }] = useLoginMutation();

  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  // Faqat raqam va bitta "+" belgisiga ruxsat — harf yozib bo'lmaydi.
  const handlePhoneChange = (e) => {
    const value = e.target.value;
    const hasPlus = value.startsWith("+");
    const digits = value.replace(/[^0-9]/g, "");
    setPhoneNumber(hasPlus ? `+${digits}` : digits);
  };

  const validate = () => {
    if (!phoneNumber.trim()) {
      return "Telefon raqam kiriting";
    }

    if (!PHONE_REGEX.test(phoneNumber.trim())) {
      return "Telefon raqam formati noto‘g‘ri";
    }

    if (!password || password.length < 6) {
      return "Parol formati noto‘g‘ri";
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isLoading) return;

    setFormError("");

    const validationError = validate();

    if (validationError) {
      setFormError(validationError);
      return;
    }

    try {
      const data = await login({
        phone_number: phoneNumber.trim(),
        password,
      }).unwrap();

      const role = data.user.role;

      if (!ALLOWED_ROLES.includes(role)) {
        throw new Error("ROLE_NOT_ALLOWED");
      }

      dispatch(
        setAuth({
          access_token: data.tokens.access_token,
          refresh_token: data.tokens.refresh_token,
          role,
          user: data.user,
        }),
      );

      navigate("/admin", { replace: true });
    } catch (error) {
      setFormError(getSafeErrorMessage(error));
    }
  };

  return (
    <div className="flex  items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-lg">
        <h1 className="text-center text-2xl font-semibold text-slate-900">
          Admin panel
        </h1>

        <p className="mt-2 text-center text-sm text-slate-500">
          Tizimga kirish
        </p>

        <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Telefon raqam
            </label>

            <input
              type="text"
              inputMode="tel"
              value={phoneNumber}
              autoComplete="tel"
              disabled={isLoading}
              onChange={handlePhoneChange}
              placeholder="+998901234567"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900 disabled:bg-slate-100"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Parol
            </label>

            <input
              type="password"
              value={password}
              autoComplete="current-password"
              disabled={isLoading}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="********"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900 disabled:bg-slate-100"
            />
          </div>

          {formError && (
            <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
              {formError}
            </div>
          )}

          <button
            disabled={isLoading}
            type="submit"
            className="w-full rounded-xl border border-slate-300 bg-white py-3 font-medium text-slate-900 transition hover:bg-slate-100 disabled:opacity-50"
          >
            {isLoading ? "Kirilmoqda..." : "Kirish"}
          </button>
        </form>
      </div>
    </div>
  );
}
