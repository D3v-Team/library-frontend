import { Inbox } from "lucide-react";

export default function EmptyData({ text }) {
  return (
    <div className="flex w-full flex-col items-center justify-center py-20">
      <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-white shadow-sm">
        <Inbox className="h-12 w-12 text-blue-500" />
      </div>
      <p className="mb-2 text-lg font-semibold text-gray-900">{text}</p>
      <p className="max-w-md text-center text-sm text-gray-500">
        Bu yerda hozircha hech qanday ma'lumot yo'q. Yangi yozuv qo'shib ko'ring yoki keyinroq qaytib keling.
      </p>
    </div>
  );
}
