/**
 * Dizayn stansiyasining ko'rgazma sahifasi — /__ui
 *
 * Nima uchun kerak: 20 ta primitivni "yozdim, ishlaydi" deb topshirish
 * mumkin emas. Bu sahifa har birini haqiqiy brauzerda, ikkala mavzuda
 * va uch tilda tekshirish imkonini beradi. Keyingi bosqichlarda yangi
 * komponent qo'shilganda avval shu yerda ko'riladi.
 *
 * Navigatsiyada YO'Q va sayt xaritasiga kirmaydi — faqat ishlab
 * chiqish uchun. Kerak bo'lmasa: shu fayl va routes.config.js dagi
 * "/__ui" yozuvini o'chirish kifoya.
 */

import { useState } from "react";
import { BookOpen, Download, Search } from "lucide-react";

import {
  ArchFrame,
  Badge,
  Button,
  Card,
  EmptyState,
  Field,
  GirihSurface,
  Input,
  Rail,
  Reveal,
  Rule,
  Select,
  Skeleton,
  SkeletonText,
  Textarea,
  ThemeToggle,
} from "../ui";
import { PageMeta, PageShell, SectionHeader } from "../patterns";
import { useLocalized } from "../lib/useLocalized";

/** Til tanlash mantig'ini tekshirish uchun soxta yozuv */
const SAMPLE = {
  title_latin: "O'tkan kunlar",
  title_ru: "Минувшие дни",
  title_cyril: "Ўткан кунлар",
  // Ataylab faqat bitta tilda — fallback zanjiri tekshiriladi
  subtitle_latin: "Abdulla Qodiriy",
  published_at: "1926-03-14T00:00:00.000Z",
};

function Block({ title, note, children }) {
  return (
    <section className="border-t border-line pt-8">
      <h3 className="font-sans text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-gold-dim">
        {title}
      </h3>
      {note && (
        <p className="mt-2 max-w-measure font-sans text-[0.85rem] leading-relaxed text-fg-muted">
          {note}
        </p>
      )}
      <div className="mt-6">{children}</div>
    </section>
  );
}

export default function UiGallery() {
  const { lang, pick, formatDate, formatNumber } = useLocalized();
  const [loading, setLoading] = useState(true);

  return (
    <PageShell
      breadcrumbs={[{ label: "Dizayn stansiyasi" }]}
      eyebrow="Ishlab chiqish"
      title="Komponent ko'rgazmasi"
      lede="Peshtoq dizayn tizimining barcha primitivlari. Bu sahifa navigatsiyada yo'q."
      meta={
        <>
          <PageMeta label="primitiv" value="17" />
          <PageMeta label="naqsh" value="3" />
          <PageMeta label="til" value={lang} />
        </>
      }
      actions={<ThemeToggle />}
    >
      <div className="flex flex-col gap-14">
        <Block
          title="useLocalized()"
          note="25 faylda qo'lda yozilgan til tanlash mantig'i o'rniga bittasi. Fallback zanjiri: so'ralgan til → lotin → rus → kirill."
        >
          <dl className="grid gap-3 font-mono text-[0.8rem] sm:grid-cols-2">
            <div className="rounded-card border border-line bg-paper-2 p-4">
              <dt className="text-fg-faint">pick(obj, &quot;title&quot;)</dt>
              <dd className="mt-1 font-sans text-[0.95rem] font-medium text-fg">
                {pick(SAMPLE, "title")}
              </dd>
            </div>
            <div className="rounded-card border border-line bg-paper-2 p-4">
              <dt className="text-fg-faint">
                pick(obj, &quot;subtitle&quot;) — faqat lotinda mavjud
              </dt>
              <dd className="mt-1 font-sans text-[0.95rem] font-medium text-fg">
                {pick(SAMPLE, "subtitle")}
              </dd>
            </div>
            <div className="rounded-card border border-line bg-paper-2 p-4">
              <dt className="text-fg-faint">formatDate()</dt>
              <dd className="mt-1 font-sans text-[0.95rem] font-medium text-fg">
                {formatDate(SAMPLE.published_at)}
              </dd>
            </div>
            <div className="rounded-card border border-line bg-paper-2 p-4">
              <dt className="text-fg-faint">formatNumber(4312)</dt>
              <dd className="mt-1 font-sans text-[0.95rem] font-medium text-fg tabular">
                {formatNumber(4312)}
              </dd>
            </div>
          </dl>
        </Block>

        <Block title="Button" note="to → <Link>, href → <a>, aks holda <button>.">
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-2.5">
              <Button variant="primary" iconStart={<Search size={15} />}>
                Katalogdan izlash
              </Button>
              <Button variant="secondary">Ikkilamchi</Button>
              <Button variant="ghost">Uchlamchi</Button>
              <Button variant="danger">Bekor qilish</Button>
              <Button variant="secondary" disabled>
                O‘chirilgan
              </Button>
            </div>
            <div className="flex flex-wrap items-center gap-2.5">
              <Button size="sm">Kichik</Button>
              <Button size="md">O‘rta</Button>
              <Button size="lg" iconEnd={<Download size={16} />}>
                Katta
              </Button>
              <Button to="/books" variant="secondary">
                Havola tugma
              </Button>
            </div>
          </div>
        </Block>

        <Block title="Badge" note="Rang ma'no tashiydi, bezak emas.">
          <div className="flex flex-wrap gap-2">
            <Badge>Badiiy adabiyot</Badge>
            <Badge tone="gold">Tanlangan</Badge>
            <Badge tone="olive">Elektron nusxa bor</Badge>
            <Badge tone="clay">Band</Badge>
            <Badge tone="lapis">Yangi kelgan</Badge>
          </div>
        </Block>

        <Block
          title="Field · Input · Select · Textarea"
          note="Label majburiy va aria bog'lanishlari avtomatik — placeholder label o'rnini bosmaydi."
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Kitob nomi" required hint="Lotin yozuvida">
              {(a) => <Input {...a} placeholder="Masalan: Boburnoma" />}
            </Field>
            <Field label="Janr">
              {(a) => (
                <Select {...a} defaultValue="">
                  <option value="">Barcha janrlar</option>
                  <option value="1">Badiiy adabiyot</option>
                  <option value="2">Ilmiy</option>
                </Select>
              )}
            </Field>
            <Field label="Elektron pochta" error="Bu pochta manzili noto'g'ri">
              {(a) => <Input {...a} invalid defaultValue="salom@" />}
            </Field>
            <Field label="Murojaat matni" hint="Kamida 20 belgi">
              {(a) => <Textarea {...a} rows={4} />}
            </Field>
          </div>
        </Block>

        <Block
          title="Card · ArchFrame · muqova tilt (naqsh 3)"
          note="Kursorni muqova ustiga olib boring — kitob 3D buriladi va tilla yon chizig'i yorishadi."
        >
          <div className="grid gap-5 sm:grid-cols-3">
            <div className="u-tilt-wrap">
              <Card interactive to="/books" className="block overflow-hidden p-3">
                <span className="u-tilt relative block overflow-hidden rounded-field bg-ink-deep">
                  <span className="block aspect-[2/3]" />
                  <span
                    aria-hidden="true"
                    className="absolute inset-y-0 left-0 w-1.5 bg-gradient-to-b from-transparent via-gold to-transparent"
                  />
                  <span className="u-tilt-glint" />
                </span>
                <span className="mt-3 block font-display text-[0.95rem] font-semibold text-fg">
                  {pick(SAMPLE, "title")}
                </span>
                <span className="block font-sans text-[0.8rem] text-fg-muted">
                  {pick(SAMPLE, "subtitle")}
                </span>
              </Card>
            </div>

            <div>
              <ArchFrame ratio="3 / 4">
                <span className="girih-tile absolute inset-0" />
              </ArchFrame>
              <p className="mt-3 font-sans text-[0.8rem] text-fg-muted">
                Peshtoq maskasi
              </p>
            </div>

            <div>
              <ArchFrame soft reveal ratio="3 / 4">
                <span className="girih-tile absolute inset-0" />
              </ArchFrame>
              <p className="mt-3 font-sans text-[0.8rem] text-fg-muted">
                Yumshoq ravoq + ochilish (naqsh 4) — hover qiling
              </p>
            </div>
          </div>
        </Block>

        <Block
          title="Skeleton (naqsh 12)"
          note="Iliq zamin ustidan o'tadigan tilla shu'la. Hozirgi bg-slate-300 qora blok effekti o'rniga."
        >
          <div className="flex flex-col gap-4">
            <Button size="sm" onClick={() => setLoading((v) => !v)}>
              {loading ? "Kontentni ko'rsatish" : "Yuklanish holatiga qaytish"}
            </Button>

            <div className="grid gap-5 sm:grid-cols-3">
              {loading ? (
                <>
                  <div className="flex flex-col gap-3">
                    <Skeleton className="aspect-[2/3] w-full" rounded="card" />
                    <SkeletonText lines={2} />
                  </div>
                  <div className="flex flex-col gap-3">
                    <Skeleton className="aspect-[2/3] w-full" rounded="card" />
                    <SkeletonText lines={2} />
                  </div>
                  <div className="flex flex-col gap-3">
                    <Skeleton className="aspect-[2/3] w-full" rounded="card" />
                    <SkeletonText lines={2} />
                  </div>
                </>
              ) : (
                <p className="font-sans text-[0.88rem] text-fg-muted">
                  Kontent keldi. Skeleton haqiqiy kontentning o‘lchamini
                  takrorlagani uchun sahifa sakramadi.
                </p>
              )}
            </div>
          </div>
        </Block>

        <Block
          title="Rail (naqsh 8)"
          note="Marquee o'rnini bosadi. Strelka, drag, g'ildirak yoki ← → bilan boshqariladi — kontent o'z-o'zidan qimirlamaydi."
        >
          <Rail label="Namuna rels">
            {Array.from({ length: 10 }).map((_, i) => (
              <Card key={i} className="w-44 p-4">
                <span className="font-mono text-[0.72rem] text-gold-dim">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="mt-2 font-display text-[0.92rem] font-semibold text-fg">
                  Kitob {i + 1}
                </p>
              </Card>
            ))}
          </Rail>
        </Block>

        <Block
          title="Reveal (naqsh 1) va Rule (naqsh 5)"
          note="Sahifani pastga suring — kartochkalar 45ms qadam bilan ketma-ket chiqadi, tilla chiziq chapdan o'ngga chiziladi. Bir marta."
        >
          <Reveal className="grid gap-4 sm:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="p-4">
                <Rule width="short" />
                <p className="mt-3 font-sans text-[0.85rem] text-fg">
                  Element {i + 1}
                </p>
              </Card>
            ))}
          </Reveal>
        </Block>

        <Block
          title="GirihSurface + SectionHeader"
          note="Signatura sirt: har sahifada kamida bitta. Bu 'dizayn homroq' taassurotini eng tez yo'qotadi."
        >
          <GirihSurface parallax className="rounded-card p-8 sm:p-12">
            <SectionHeader
              onInk
              eyebrow="Fond"
              title="Yangi kelgan kitoblar"
              lede="Kutubxona fondiga shu oyda qo'shilgan nashrlar."
              action={
                <Button variant="onInk" size="sm" iconStart={<BookOpen size={15} />}>
                  Barchasi
                </Button>
              }
            />
          </GirihSurface>
        </Block>

        <Block
          title="EmptyState"
          note="API bo'sh qaytarsa oq ekran emas: naqsh, aniq matn va chiqish yo'li."
        >
          <EmptyState
            title="Bu filtr bo'yicha kitob topilmadi"
            description="Tanlangan janr va yil birgalikda juda tor. Filtrni kengaytirib ko'ring."
            actions={
              <>
                <Button size="sm" variant="primary">
                  Filtrni tozalash
                </Button>
                <Button size="sm" variant="secondary">
                  Barcha janrlar
                </Button>
              </>
            }
          />
        </Block>
      </div>
    </PageShell>
  );
}
