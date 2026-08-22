import { useState } from "react";
import toast from "react-hot-toast";

import {
  MapPin,
  Phone,
  Mail,
  Globe,
  Pencil,
  Trash2,
  Plus,
  Instagram,
  Facebook,
  Send,
  Youtube,
  Linkedin,
  Twitter,
  MessageCircle,
} from "lucide-react";

import AdminPageHeader from "./components/AdminPageHeader";
import Modal from "./components/Modal";
import ConfirmDialog from "./components/ConfirmDialog";
import FormField from "./components/FormField";

import {
  useGetContactInfoQuery,
  useUpdateContactInfoMutation,
  useCreateSocialLinkMutation,
  useUpdateSocialLinkMutation,
  useDeleteSocialLinkMutation,
} from "../../store/services/contact.info";

const emptyContactForm = {
  address_latin: "",
  address_cyril: "",
  address_ru: "",
  phone: "",
  email: "",
  latitude: "",
  longitude: "",
};

const emptySocialForm = {
  platform: "telegram",
  url: "",
  icon_image: null,
};

const SOCIAL_PLATFORMS = [
  {
    value: "telegram",
    label: "Telegram",
    icon: Send,
  },
  {
    value: "instagram",
    label: "Instagram",
    icon: Instagram,
  },
  {
    value: "facebook",
    label: "Facebook",
    icon: Facebook,
  },
  {
    value: "twitter",
    label: "Twitter",
    icon: Twitter,
  },
  {
    value: "linkedin",
    label: "LinkedIn",
    icon: Linkedin,
  },
  {
    value: "youtube",
    label: "YouTube",
    icon: Youtube,
  },
  {
    value: "tiktok",
    label: "TikTok",
    icon: MessageCircle,
  },
  {
    value: "whatsapp",
    label: "WhatsApp",
    icon: MessageCircle,
  },
];

export default function ContactInfo() {
  const { data, isLoading, error, isFetching } = useGetContactInfoQuery();

  const [updateContactInfo, { isLoading: isUpdatingContact }] =
    useUpdateContactInfoMutation();

  const [createSocialLink, { isLoading: isCreatingSocial }] =
    useCreateSocialLinkMutation();

  const [updateSocialLink, { isLoading: isUpdatingSocial }] =
    useUpdateSocialLinkMutation();

  const [deleteSocialLink, { isLoading: isDeletingSocial }] =
    useDeleteSocialLinkMutation();

  // ================= CONTACT MODAL =================

  const [contactModalOpen, setContactModalOpen] = useState(false);

  const [contactForm, setContactForm] = useState(emptyContactForm);

  // ================= SOCIAL MODAL =================

  const [socialModalOpen, setSocialModalOpen] = useState(false);

  const [editingSocial, setEditingSocial] = useState(null);

  const [socialForm, setSocialForm] = useState(emptySocialForm);

  const [deleteTarget, setDeleteTarget] = useState(null);

  const contactInfo = data ?? {};

  const socialLinks = contactInfo?.social_links ?? [];

  // ================= CONTACT HANDLERS =================

  const openContactEdit = () => {
    setContactForm({
      address_latin: contactInfo.address_latin ?? "",

      address_cyril: contactInfo.address_cyril ?? "",

      address_ru: contactInfo.address_ru ?? "",

      phone: contactInfo.phone ?? "",

      email: contactInfo.email ?? "",

      latitude: contactInfo.latitude ?? "",

      longitude: contactInfo.longitude ?? "",
    });

    setContactModalOpen(true);
  };

  const changeContactField = (field, value) => {
    setContactForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const submitContactHandler = async (e) => {
    e.preventDefault();

    try {
      await updateContactInfo({
        address_latin: contactForm.address_latin,

        address_cyril: contactForm.address_cyril,

        address_ru: contactForm.address_ru,

        phone: contactForm.phone,

        email: contactForm.email,

        latitude: contactForm.latitude ? Number(contactForm.latitude) : null,

        longitude: contactForm.longitude ? Number(contactForm.longitude) : null,
      }).unwrap();

      toast.success("Aloqa ma'lumotlari yangilandi");

      setContactModalOpen(false);
    } catch (err) {
      toast.error(err?.data?.message || "Xatolik yuz berdi");
    }
  };

  // ================= SOCIAL HANDLERS =================

  const openCreateSocial = () => {
    setEditingSocial(null);

    setSocialForm({
      ...emptySocialForm,
    });

    setSocialModalOpen(true);
  };

  const openEditSocial = (item) => {
    setEditingSocial(item);

    setSocialForm({
      platform: item.platform ?? "telegram",

      url: item.url ?? "",

      icon_image: null,
    });

    setSocialModalOpen(true);
  };

  const changeSocialField = (field, value) => {
    setSocialForm((prev) => ({
      ...prev,

      [field]: value,
    }));
  };

  const submitSocialHandler = async (e) => {
    e.preventDefault();

    try {
      if (editingSocial) {
        await updateSocialLink({
          platform: editingSocial.platform,

          url: socialForm.url,

          ...(socialForm.icon_image && {
            icon_image: socialForm.icon_image,
          }),
        }).unwrap();

        toast.success("Ijtimoiy tarmoq yangilandi");
      } else {
        await createSocialLink({
          platform: socialForm.platform,

          url: socialForm.url,

          ...(socialForm.icon_image && {
            icon_image: socialForm.icon_image,
          }),
        }).unwrap();

        toast.success("Ijtimoiy tarmoq qo‘shildi");
      }

      setSocialModalOpen(false);
    } catch (err) {
      toast.error(err?.data?.message || "Xatolik yuz berdi");
    }
  };

  const confirmDeleteSocial = async () => {
    if (!deleteTarget) return;

    try {
      await deleteSocialLink(deleteTarget.platform).unwrap();

      toast.success("Ijtimoiy tarmoq o‘chirildi");

      setDeleteTarget(null);
    } catch (err) {
      toast.error(err?.data?.message || "O‘chirishda xatolik");
    }
  };

  const getSocialPlatform = (platform) => {
    return SOCIAL_PLATFORMS.find((item) => item.value === platform);
  };

  const getSocialIcon = (platform) => {
    const item = getSocialPlatform(platform);

    return item?.icon || Globe;
  };

  const isSaving = isUpdatingContact || isCreatingSocial || isUpdatingSocial;

  return (
    <div>
      {" "}
      <AdminPageHeader
        title="Aloqa ma'lumotlari"
        description="Kutubxonaning aloqa ma'lumotlari va ijtimoiy tarmoqlarini boshqaring."
        actionLabel="Ijtimoiy tarmoq qo‘shish"
        onAction={openCreateSocial}
      />
      {isLoading ? (
        <div
          className="
          grid
          gap-5
          md:grid-cols-2
          xl:grid-cols-3
        "
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="
              h-32
              rounded-2xl
              bg-blue-700
              animate-pulse
              "
            />
          ))}
        </div>
      ) : error ? (
        <div
          className="
          rounded-xl
          bg-red-50
          px-6
          py-12
          text-center
          text-red-600
          "
        >
          Aloqa ma'lumotlarini yuklashda xatolik.
        </div>
      ) : (
        <>
          {/* CONTACT INFO */}

          <section
            className="
            rounded-2xl
            border
            border-slate-200
            bg-white
            p-6
            shadow-sm
            "
          >
            <div
              className="
              mb-5
              flex
              items-center
              justify-between
              "
            >
              <h2
                className="
                text-lg
                font-semibold
                text-slate-900
                "
              >
                Asosiy aloqa
              </h2>

              <button
                type="button"
                onClick={openContactEdit}
                className="
                flex
                items-center
                gap-2
                rounded-lg
                border
                px-4
                py-2
                text-sm
                font-medium
                text-black
                hover:bg-slate-50
                "
              >
                <Pencil size={15} />
                Tahrirlash
              </button>
            </div>

            <div
              className="
              grid
              gap-5
              md:grid-cols-2
              "
            >
              <InfoCard
                icon={MapPin}
                title="Manzil"
                value={contactInfo.address_latin}
              />

              <InfoCard
                icon={Phone}
                title="Telefon"
                value={contactInfo.phone}
              />

              <InfoCard icon={Mail} title="Email" value={contactInfo.email} />

              <InfoCard
                icon={Globe}
                title="Koordinatalar"
                value={`${contactInfo.latitude ?? "-"}, ${contactInfo.longitude ?? "-"}`}
              />
            </div>
          </section>

          {/* SOCIAL LINKS */}

          <section className="mt-8">
            <div
              className="
              mb-5
              flex
              items-center
              justify-between
              "
            >
              <h2
                className="
                text-lg
                font-semibold
                text-slate-900
                "
              >
                Ijtimoiy tarmoqlar
              </h2>

              <button
                type="button"
                onClick={openCreateSocial}
                className="
                flex
                items-center
                gap-2
                rounded-lg
                bg-slate-900
                px-4
                py-2
                text-sm
                font-medium
                text-white
                "
              >
                <Plus size={15} />
                Qo‘shish
              </button>
            </div>

            {socialLinks.length === 0 ? (
              <div
                className="
                  rounded-2xl
                  border
                  border-dashed
                  border-slate-300
                  bg-white
                  px-6
                  py-12
                  text-center
                  text-sm
                  text-slate-500
                  "
              >
                Ijtimoiy tarmoqlar mavjud emas.
              </div>
            ) : (
              <div
                className="
                  grid
                  gap-5
                  md:grid-cols-2
                  xl:grid-cols-3
                  "
              >
                {socialLinks.map((item) => {
                  const Icon = getSocialIcon(item.platform);

                  const platform = getSocialPlatform(item.platform);

                  return (
                    <div
                      key={item.platform}
                      className="
                          rounded-2xl
                          border
                          border-slate-200
                          bg-white
                          p-5
                          shadow-sm
                          "
                    >
                      <div
                        className="
                            flex
                            items-start
                            justify-between
                            gap-3
                            "
                      >
                        <div
                          className="
                              flex
                              items-center
                              gap-3
                              "
                        >
                          <div
                            className="
                                flex
                                h-11
                                w-11
                                items-center
                                justify-center
                                rounded-xl
                                bg-slate-100
                                text-slate-700
                                "
                          >
                            <Icon size={20} />
                          </div>

                          <div>
                            <h3
                              className="
                                  font-semibold
                                  text-slate-900
                                  "
                            >
                              {platform?.label || item.platform}
                            </h3>

                            <a
                              href={item.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="
                                  text-xs
                                  text-blue-600
                                  hover:underline
                                  "
                            >
                              {item.url}
                            </a>
                          </div>
                        </div>

                        <div
                          className="
                              flex
                              gap-2
                              "
                        >
                          <button
                            type="button"
                            onClick={() => openEditSocial(item)}
                            className="
                                rounded-lg
                                border
                                border-slate-200
                                p-2
                                text-slate-500
                                hover:bg-slate-50
                                "
                          >
                            <Pencil size={14} />
                          </button>

                          <button
                            type="button"
                            onClick={() => setDeleteTarget(item)}
                            className="
                                rounded-lg
                                border
                                border-red-200
                                p-2
                                text-red-500
                                hover:bg-red-50
                                "
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </>
      )}
      {/* CONTACT MODAL */}
      <Modal
        open={contactModalOpen}
        onClose={() => setContactModalOpen(false)}
        title="Aloqa ma'lumotlarini tahrirlash"
        size="lg"
      >
        <form onSubmit={submitContactHandler} className="space-y-5">
          <FormField
            label="Manzil (Lotin)"
            value={contactForm.address_latin}
            onChange={(e) =>
              changeContactField("address_latin", e.target.value)
            }
          />

          <FormField
            label="Manzil (Kirill)"
            value={contactForm.address_cyril}
            onChange={(e) =>
              changeContactField("address_cyril", e.target.value)
            }
          />

          <FormField
            label="Manzil (Rus)"
            value={contactForm.address_ru}
            onChange={(e) => changeContactField("address_ru", e.target.value)}
          />

          <div
            className="
            grid
            gap-4
            md:grid-cols-2
            "
          >
            <FormField
              label="Telefon"
              value={contactForm.phone}
              onChange={(e) => changeContactField("phone", e.target.value)}
            />

            <FormField
              label="Email"
              value={contactForm.email}
              onChange={(e) => changeContactField("email", e.target.value)}
            />
          </div>

          <div
            className="
            grid
            gap-4
            md:grid-cols-2
            "
          >
            <FormField
              label="Latitude"
              value={contactForm.latitude}
              onChange={(e) => changeContactField("latitude", e.target.value)}
            />

            <FormField
              label="Longitude"
              value={contactForm.longitude}
              onChange={(e) => changeContactField("longitude", e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={isUpdatingContact}
            className="
            w-full
            rounded-lg
            bg-slate-900
            py-3
            text-sm
            font-medium
            text-black
            disabled:opacity-50
            "
          >
            {isUpdatingContact ? "Saqlanmoqda..." : "Saqlash"}
          </button>
        </form>
      </Modal>
      {/* SOCIAL MODAL */}
      <Modal
        open={socialModalOpen}
        onClose={() => {
          setSocialModalOpen(false);
          setEditingSocial(null);
        }}
        title={
          editingSocial
            ? "Ijtimoiy tarmoqni tahrirlash"
            : "Ijtimoiy tarmoq qo‘shish"
        }
        size="md"
      >
        <form onSubmit={submitSocialHandler} className="space-y-5">
          <FormField
            as="select"
            label="Platforma"
            value={socialForm.platform}
            onChange={(e) => changeSocialField("platform", e.target.value)}
          >
            {SOCIAL_PLATFORMS.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </FormField>

          <FormField
            label="URL"
            value={socialForm.url}
            onChange={(e) => changeSocialField("url", e.target.value)}
          />

          <div>
            <label
              className="
              mb-2
              block
              text-sm
              font-medium
              text-slate-700
              "
            >
              Icon rasm
            </label>

            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                changeSocialField("icon_image", e.target.files[0])
              }
              className="
              block
              w-full
              text-sm
              text-slate-500
              "
            />
          </div>

          <button
            type="submit"
            disabled={isCreatingSocial || isUpdatingSocial}
            className="
            w-full
            rounded-lg
            border
            py-3
            text-sm
            font-medium
            text-black
            disabled:opacity-50
            hover:bg-slate-50
            "
          >
            {isCreatingSocial || isUpdatingSocial
              ? "Saqlanmoqda..."
              : "Saqlash"}
          </button>
        </form>
      </Modal>
      {/* DELETE CONFIRM */}
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDeleteSocial}
        isLoading={isDeletingSocial}
        title="Ijtimoiy tarmoqni o‘chirish"
        description={`
          ${deleteTarget?.platform || ""}
          ijtimoiy tarmog‘ini o‘chirmoqchimisiz?
        `}
      />
    </div>
  );
}

function InfoCard({ icon: Icon, title, value }) {
  return (
    <div
      className="
      rounded-xl
      border
      border-slate-200
      bg-slate-50
      p-5
      "
    >
      <div
        className="
        flex
        items-center
        gap-3
        "
      >
        <div
          className="
          flex
          h-11
          w-11
          items-center
          justify-center
          rounded-lg
          bg-white
          text-slate-700
          "
        >
          <Icon size={20} />
        </div>

        <div>
          <p
            className="
            text-xs
            text-slate-400
            "
          >
            {title}
          </p>

          <p
            className="
            mt-1
            text-sm
            font-medium
            text-slate-900
            "
          >
            {value || "-"}
          </p>
        </div>
      </div>
    </div>
  );
}
