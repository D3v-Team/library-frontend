import AdminPageHeader from "./components/AdminPageHeader";
import AdminTablePlaceholder from "./components/AdminTablePlaceholder";

export default function News() {
  return (
    <div>
      <AdminPageHeader
        title="Yangiliklar"
        description="Sayt uchun e'lon va yangiliklarni boshqaring."
        actionLabel="Yangilik qo‘shish"
      />

      <AdminTablePlaceholder
        columns={["Sarlavha", "Sana", "Kategoriya"]}
        rows={[
          ["Kutubxonamizda yangi xizmatlar ishga tushirildi", "12.08.2026", "E'lon"],
          ["Elektron katalogdan foydalanish tartibi", "08.08.2026", "E'lon"],
          ["Kitobxonlar uchun yangi imkoniyatlar", "01.08.2026", "Muhim"],
        ]}
      />
    </div>
  );
}
