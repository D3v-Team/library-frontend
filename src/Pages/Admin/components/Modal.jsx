import Dialog from "../../../ui/Dialog";

/**
 * Admin panelining modal qobig'i.
 *
 * Endi bu FAQAT moslashtirgich — barcha ish `ui/Dialog` da bajariladi.
 * Ilgari bu yerda mustaqil nusxa bor edi va uchta kamchiligi bor edi:
 *
 *  1. Ochilish `requestAnimationFrame` + `transition` ga tayangan.
 *     Agar o'sha kadr kelmasa (fonda yuklangan sahifa), modal
 *     `opacity: 0` da qolib, lekin scroll blokini ushlab turardi —
 *     ya'ni ko'rinmas, lekin sahifani bloklagan modal. Public
 *     tomonda bu o'lchab tekshirilgan va animatsiyaga o'tkazilgan.
 *  2. Fokus tuzoqqa olinmasdi va yopilganda chaqirgan tugmaga
 *     qaytmasdi — klaviatura foydalanuvchisi modal ortidagi sahifa
 *     bo'ylab Tab bosib yo'qolib qolardi.
 *  3. `translate-y-50` klassi Tailwind da MAVJUD EMAS (spacing
 *     shkalasida 50 yo'q), ya'ni u hech narsa qilmayotgan o'lik kod edi.
 *
 * O'lchamlar saqlanadi: admin formalari ko'p maydonli va uch tilda,
 * shuning uchun ular public modallardan kengroq.
 */
const SIZE_MAP = {
  sm: "sm", // max-w-md
  md: "lg", // max-w-2xl — admin ning oldingi "md" si
  lg: "xl", // max-w-4xl — admin ning oldingi "lg" si
};

export default function Modal({ open, onClose, title, description, size = "md", children }) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      size={SIZE_MAP[size] ?? "lg"}
    >
      {children}
    </Dialog>
  );
}
