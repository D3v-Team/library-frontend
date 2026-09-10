import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

import cx from "../lib/cx";

/**
 * Non uvoqlari — foydalanuvchi saytning qayerida turganini ko'rsatadi.
 *
 * Audit topilmasi: ichki sahifalarda bu umuman yo'q. Kitob
 * sahifasiga qidiruvdan tushgan odam kutubxona strukturasini
 * ko'rmaydi va "yuqoriga" chiqish yo'li faqat brauzerning orqaga
 * tugmasi bo'lib qoladi.
 *
 * Ataylab route dan avtomatik yasalmaydi: `/books/12` dan
 * "Kitob nomi" ni chiqarib olish uchun API ma'lumoti kerak,
 * shuning uchun sahifa o'zi beradi.
 *
 *   items={[{ label: "Fond", to: "/books" }, { label: book.title }]}
 * Oxirgi element joriy sahifa — havola bo'lmaydi.
 */
export default function Breadcrumbs({ items = [], onInk = false, className }) {
  if (!items.length) return null;

  return (
    <nav aria-label="Sayt bo'ylab yo'l" className={className}>
      <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1 font-sans text-[0.78rem]">
        <li>
          <Link
            to="/"
            className={cx(
              "transition-colors duration-1 ease-out-soft",
              onInk ? "text-on-ink/60 hover:text-gold" : "text-fg-faint hover:text-accent",
            )}
          >
            Bosh sahifa
          </Link>
        </li>

        {items.map((item, i) => {
          const last = i === items.length - 1;

          return (
            <li key={`${item.label}-${i}`} className="flex items-center gap-1.5">
              <ChevronRight
                size={13}
                strokeWidth={1.8}
                aria-hidden="true"
                className={onInk ? "text-on-ink/35" : "text-fg-faint"}
              />

              {last || !item.to ? (
                <span
                  aria-current={last ? "page" : undefined}
                  className={cx(
                    "font-medium",
                    onInk ? "text-on-ink" : "text-fg",
                  )}
                >
                  {item.label}
                </span>
              ) : (
                <Link
                  to={item.to}
                  className={cx(
                    "transition-colors duration-1 ease-out-soft",
                    onInk ? "text-on-ink/60 hover:text-gold" : "text-fg-faint hover:text-accent",
                  )}
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
