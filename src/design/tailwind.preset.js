/**
 * PESHTOQ — Tailwind preseti.
 *
 * Tokenlarni (src/design/tokens.css) Tailwind klasslariga ulaydi:
 *   bg-paper  bg-paper-2  text-fg-muted  border-line-soft
 *   bg-ink-deep  text-gold  text-accent  bg-ink/40
 *
 * MUHIM: hamma narsa `extend` ichida. Loyihada hozir 40+ faylda
 * `slate`, `blue`, `rounded-2xl`, `shadow-sm` ishlatilgan — ularni
 * o'chirib qo'ysak sayt jim-jitlik bilan buziladi. Shuning uchun
 * zavod qiymatlari saqlanadi, biz faqat ustiga qo'shamiz.
 */

/**
 * TUZOQ — opasitet modifikatorlari 5 ga karrali bo'lishi SHART.
 *
 * `bg-gold/10`, `border-line/35`, `text-on-ink/70` — ishlaydi.
 * `bg-gold/12`, `text-on-ink/72` — CSS ga UMUMAN tushmaydi va
 * brauzerda hech qanday xato ham bermaydi: element shunchaki
 * shaffof qoladi. Sababi Tailwind ning standart `opacity`
 * shkalasi 0..100 oralig'ida 5 qadam bilan borishi.
 *
 * Oraliq qiymat kerak bo'lsa kvadrat qavs ishlatiladi:
 *   bg-gold/[0.12]
 *
 * Bu tuzoq 2-bosqichda haqiqatan qo'lga tushdi — Badge ning
 * zamini `bg-gold/12` bilan yozilgan va butunlay shaffof
 * bo'lib chiqqan edi.
 */

/** Kanal tokenini Tailwind ranggiga aylantiradi (shaffoflik bilan). */
const c = (channel) => `rgb(var(${channel}) / <alpha-value>)`;

export default {
  // Tokenlar mavzuni o'zi almashtiradi, shuning uchun `dark:` klasslari
  // deyarli kerak bo'lmaydi. Kerak bo'lgan kamdan-kam holat uchun —
  // foydalanuvchi tanlagan tungi rejimga bog'lanadi.
  darkMode: ["selector", '[data-theme="dark"]'],

  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: c("--ink-rgb"),
          deep: c("--ink-deep-rgb"),
          soft: c("--ink-soft-rgb"),
        },
        gold: {
          DEFAULT: c("--gold-rgb"),
          dim: c("--gold-dim-rgb"),
        },
        lapis: {
          DEFAULT: c("--lapis-rgb"),
          lift: c("--lapis-lift-rgb"),
        },
        olive: c("--olive-rgb"),
        clay: c("--clay-rgb"),

        page: c("--page-rgb"),
        paper: {
          DEFAULT: c("--paper-rgb"),
          2: c("--paper-2-rgb"),
          3: c("--paper-3-rgb"),
        },
        line: {
          DEFAULT: c("--line-rgb"),
          soft: c("--line-soft-rgb"),
        },
        fg: {
          DEFAULT: c("--fg-rgb"),
          muted: c("--fg-muted-rgb"),
          faint: c("--fg-faint-rgb"),
        },
        accent: c("--accent-rgb"),
        "on-ink": c("--on-ink-rgb"),

        /* ---------- Admin paneli uchun ramp qayta xaritalash ----------
           Admin panelda `slate-*` va `blue-*` ~570 joyda ishlatilgan.
           Har birini qo'lda o'zgartirish 10 000 qatorni qayta yozishni
           talab qilardi. O'rniga ramplarning O'ZINI tokenlarga
           bog'laymiz: bitta o'zgarish butun admin panelni tizimga
           o'tkazadi.

           Bu xavfsiz, chunki public sayt allaqachon `slate`/`blue` dan
           voz kechgan — tekshirildi, qolgan topilmalar faqat izohlarda.
           Yon foyda: hali ko'chirilmagan `BackToTop` va login sahifasi
           ham avtomatik moslashadi.

           `white` ATAYLAB o'zgartirilmaydi: admin kartochkalari oq
           qog'oz zaminda turishi kerak, va rangli tugmalardagi
           `text-white` oq qolishi shart. */
        slate: {
          50: c("--paper-3-rgb"),
          100: c("--line-soft-rgb"),
          200: c("--line-rgb"),
          300: c("--line-rgb"),
          400: c("--fg-faint-rgb"),
          500: c("--fg-muted-rgb"),
          600: c("--fg-muted-rgb"),
          700: c("--fg-rgb"),
          800: c("--ink-soft-rgb"),
          900: c("--ink-rgb"),
          950: c("--ink-deep-rgb"),
        },
        /* Semantik ranglar ham tizimga: qizil → terrakota (clay),
           yashil → zaytun (olive), sariq → tilla. Dizayn hujjatida
           belgilangan ma'no shu edi, admin esa Tailwind ning zavod
           qizilini ishlatardi va u palitradan ajralib turardi. */
        red: {
          50: c("--clay-tint-rgb"),
          100: c("--clay-tint-rgb"),
          200: c("--clay-rgb"),
          300: c("--clay-rgb"),
          500: c("--clay-rgb"),
          600: c("--clay-rgb"),
          700: c("--clay-rgb"),
        },
        green: {
          50: c("--olive-tint-rgb"),
          100: c("--olive-tint-rgb"),
          200: c("--olive-rgb"),
          300: c("--olive-rgb"),
          500: c("--olive-rgb"),
          600: c("--olive-rgb"),
          700: c("--olive-rgb"),
        },
        amber: {
          50: c("--gold-tint-rgb"),
          500: c("--gold-rgb"),
          700: c("--gold-dim-rgb"),
        },
        /* `gray` admin da 5 joyda qolib ketgan — `slate` bilan bir xil
           xaritalanadi, aks holda ular palitradan ajralib turadi. */
        gray: {
          50: c("--paper-3-rgb"),
          100: c("--line-soft-rgb"),
          200: c("--line-rgb"),
          400: c("--fg-faint-rgb"),
          500: c("--fg-muted-rgb"),
          600: c("--fg-muted-rgb"),
          700: c("--fg-rgb"),
          900: c("--ink-rgb"),
        },
        blue: {
          50: c("--accent-tint-rgb"),
          100: c("--accent-tint-rgb"),
          200: c("--accent-rgb"),
          500: c("--accent-rgb"),
          600: c("--accent-rgb"),
          700: c("--accent-rgb"),
          800: c("--lapis-rgb"),
          900: c("--ink-rgb"),
        },
      },

      fontFamily: {
        display: "var(--font-display)",
        sans: "var(--font-sans)",
        mono: "var(--font-mono)",
      },

      fontSize: {
        // Ekran o'lchamiga o'zi moslashadi — `text-2xl sm:text-3xl lg:text-4xl`
        // kabi qo'lda yozilgan zinapoyalar kerak bo'lmaydi.
        display: ["clamp(2.5rem, 7vw, 4.75rem)", { lineHeight: "1.05", letterSpacing: "-0.02em" }],
        h1: ["clamp(1.9rem, 4vw, 2.75rem)", { lineHeight: "1.12", letterSpacing: "-0.01em" }],
        h2: ["clamp(1.5rem, 3vw, 2.25rem)", { lineHeight: "1.15", letterSpacing: "-0.01em" }],
        h3: ["clamp(1.15rem, 2vw, 1.5rem)", { lineHeight: "1.25" }],
        eyebrow: ["0.72rem", { lineHeight: "1", letterSpacing: "0.16em" }],
      },

      maxWidth: {
        container: "var(--container)",
        measure: "var(--measure)",
      },

      spacing: {
        gut: "var(--gut)",
        "header-h": "var(--header-h)",
      },

      borderRadius: {
        /* Rol bo'yicha nomlar — public sayt shularni ishlatadi */
        field: "var(--r-sm)",   /* input, badge */
        card: "var(--r-md)",    /* kartochka */
        panel: "var(--r-lg)",   /* modal, katta panel */

        /* Zavod shkalasi ham tizimga bog'lanadi — admin panel uni
           230+ joyda ishlatadi va u yerda TO'RT xil radius aralash
           yurardi (md 6px, lg 8px, xl 12px, 2xl 16px). Endi ular
           tizimning uch qiymatiga yig'iladi.

           Migratsiya boshida bunga tegmagandim, chunki o'shanda public
           sayt ham shu klasslarda edi. Endi public to'liq ko'chgan —
           tekshirildi, qolgani faqat login sahifasi va izohlar. */
        md: "var(--r-sm)",
        lg: "var(--r-md)",
        xl: "var(--r-lg)",
        "2xl": "var(--r-lg)",
        "3xl": "var(--r-lg)",
      },

      boxShadow: {
        // Faqat ikki daraja: sirt va suzuvchi
        s1: "var(--shadow-1)",
        s2: "var(--shadow-2)",

        /* Zavod darajalari ham shu ikkitasiga yig'iladi. Admin da
           beshta daraja aralash edi (sm, md, lg, xl, 2xl) va ular
           bir-biridan farq qilmaydigan chuqurlik hosil qilardi. */
        sm: "var(--shadow-1)",
        DEFAULT: "var(--shadow-1)",
        md: "var(--shadow-1)",
        lg: "var(--shadow-2)",
        xl: "var(--shadow-2)",
        "2xl": "var(--shadow-2)",
      },

      transitionTimingFunction: {
        "out-soft": "var(--e-out)",
        "in-out-soft": "var(--e-inout)",
      },

      transitionDuration: {
        1: "var(--d-1)",
        2: "var(--d-2)",
        3: "var(--d-3)",
        4: "var(--d-4)",
      },

      keyframes: {
        // Naqsh 1 — stagger reveal
        reveal: {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "none" },
        },
        // Naqsh 5 — rule draw
        ruleDraw: {
          from: { transform: "scaleX(0)" },
          to: { transform: "scaleX(1)" },
        },
        // Naqsh 12 — skeleton shimmer
        shimmer: {
          from: { backgroundPosition: "-160% 0" },
          to: { backgroundPosition: "260% 0" },
        },
      },

      animation: {
        reveal: "reveal var(--d-3) var(--e-out) both",
        "rule-draw": "ruleDraw var(--d-4) var(--e-inout) both",
        shimmer: "shimmer 1400ms linear infinite",
      },
    },
  },

  plugins: [],
};
