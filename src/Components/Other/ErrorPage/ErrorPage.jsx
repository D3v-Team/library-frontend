import { AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ErrorPage() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <div className="flex flex-col items-center gap-6 text-center">
          {/* Icon */}
          <div className="rounded-full bg-red-100 p-6 text-red-600">
            <AlertTriangle className="h-16 w-16" />
          </div>

          {/* Title */}
          <h4 className="text-xl font-bold text-gray-900">
            Xatolik yuz berdi
          </h4>

          {/* Subtitle */}
          <p className="text-gray-600">
            Kechirasiz, sahifa mavjud emas. Iltimos qaytadan urinib ko'ring yoki bosh sahifaga qayting.
          </p>

          {/* Button */}
          <button
            type="button"
            onClick={() => navigate("/")}
            className="mt-4 rounded-lg bg-red-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-red-700 active:scale-95"
          >
            Bosh sahifaga qaytish
          </button>
        </div>
      </div>
    </div>
  );
}
