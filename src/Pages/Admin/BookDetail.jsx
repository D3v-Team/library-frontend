import { useParams, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowLeft, BookOpen, Eye, Trash2 } from "lucide-react";
import ImageUploadField from "./components/ImageUploadField";
import FileUploadField, { FileListItem } from "./components/FileUploadField";
import { BASE_URL } from "../../store/api";
import {
  useGetBookByIdQuery,
  useUploadBookImageMutation,
  useDeleteBookImageMutation,
  useSetMainBookImageMutation,
  useUploadBookFileMutation,
  useDeleteBookFileMutation,
  downloadBookFile,
} from "../../store/services/books.api";
import { formatBookDate, formatBookYear } from "../../Pages/Books/bookHelpers";

export default function BookDetail() {
  const { id } = useParams();

  const { data: book, isLoading, error, refetch } = useGetBookByIdQuery(id);

  const [uploadImage] = useUploadBookImageMutation();
  const [deleteImage] = useDeleteBookImageMutation();
  const [setMainImage] = useSetMainBookImageMutation();

  const [uploadFile] = useUploadBookFileMutation();
  const [deleteFile] = useDeleteBookFileMutation();

  const images = book?.images ?? [];
  const files = book?.files ?? [];

  const getImageUrl = (url) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    return `${BASE_URL}${url}`;
  };

  const handleImagePick = async (file) => {
    if (!file) return;
    try {
      await uploadImage({ bookId: id, file }).unwrap();
      toast.success("Rasm yuklandi");
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || "Rasm yuklashda xatolik");
    }
  };

  const handleDeleteImage = async (imageId) => {
    try {
      await deleteImage({ bookId: id, imageId }).unwrap();
      toast.success("Rasm o‘chirildi");
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || "Rasmni o‘chirishda xatolik");
    }
  };

  const handleSetMainImage = async (imageId) => {
    try {
      await setMainImage({ bookId: id, imageId }).unwrap();
      toast.success("Asosiy rasm belgilandi");
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || "Amalni bajarib bo‘lmadi");
    }
  };

  const handleFileUpload = async (file) => {
    try {
      await uploadFile({ bookId: id, file }).unwrap();
      toast.success("Fayl yuklandi");
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || "Fayl yuklashda xatolik");
      throw err;
    }
  };

  const handleDeleteFile = async (fileId) => {
    try {
      await deleteFile({ bookId: id, fileId }).unwrap();
      toast.success("Fayl o‘chirildi");
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || "Faylni o‘chirishda xatolik");
    }
  };

  const handleDownloadFile = async (file) => {
    try {
      await downloadBookFile(id, file.id, file.name || file.original_name);
    } catch {
      toast.error("Faylni yuklab olishda xatolik");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-slate-100" />
        <div className="h-64 animate-pulse rounded-xl bg-slate-100" />
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="rounded-xl border border-dashed border-red-200 bg-red-50 px-6 py-12 text-center text-sm text-red-600">
        Kitob ma'lumotlarini yuklashda xatolik yuz berdi.
      </div>
    );
  }

  const mainImage = images.find((img) => img.is_main);

  return (
    <div>
      <Link
        to="/admin/books"
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft size={15} />
        Kitoblar ro‘yxatiga qaytish
      </Link>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Metadata */}
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-start gap-4">
              {mainImage ? (
                <img
                  src={getImageUrl(mainImage.url)}
                  alt=""
                  className="h-28 w-20 rounded-lg object-cover"
                />
              ) : (
                <div className="flex h-28 w-20 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-300">
                  <BookOpen size={22} />
                </div>
              )}

              <div className="min-w-0">
                <h1 className="text-xl font-semibold text-slate-900">
                  {book.name_latin}
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                  {book.author?.full_name_latin || "Muallif ko‘rsatilmagan"}
                </p>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {(book.genres ?? []).map((g) => (
                    <span
                      key={g.id}
                      className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600"
                    >
                      {g.name_latin || g.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-slate-100 pt-5 sm:grid-cols-3">
              <div>
                <dt className="text-xs text-slate-400">Nashr sanasi</dt>
                <dd className="mt-1 text-sm font-medium text-slate-800">
                  {formatBookDate(book.published_date) || "—"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-400">Nashr yili</dt>
                <dd className="mt-1 text-sm font-medium text-slate-800">
                  {formatBookYear(book.published_date) || "—"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-400">Sinf darajasi</dt>
                <dd className="mt-1 text-sm font-medium text-slate-800">
                  {book.grade_level ?? "—"}
                </dd>
              </div>
            </dl>

            {book.description_latin && (
              <div className="mt-5 border-t border-slate-100 pt-5">
                <dt className="mb-1.5 text-xs text-slate-400">Tavsif</dt>
                <p className="text-sm leading-6 text-slate-600">
                  {book.description_latin}
                </p>
              </div>
            )}
          </div>

          {/* Files */}
          <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold text-slate-900">
              Fayllar (PDF, DOC, XLS, PPT)
            </h2>

            <FileUploadField onUpload={handleFileUpload} maxSizeMb={5} />

            {files.length > 0 && (
              <div className="mt-4 space-y-2">
                {files.map((file) => (
                  <FileListItem
                    key={file.id}
                    file={file}
                    isDeleting={false}
                    onDownload={() => handleDownloadFile(file)}
                    onDelete={() => handleDeleteFile(file.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Images */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold text-slate-900">Rasmlar</h2>

          <ImageUploadField
            value={null}
            existingUrl={null}
            onChange={handleImagePick}
            maxSizeMb={3}
          />

          {images.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-3">
              {images.map((img) => (
                <div key={img.id} className="group relative">
                  <img
                    src={getImageUrl(img.url)}
                    alt=""
                    className={`h-20 w-20 rounded-lg object-cover ${
                      img.is_main ? "ring-2 ring-slate-900" : ""
                    }`}
                  />
                  {img.is_main && (
                    <span className="absolute left-1 top-1 rounded bg-slate-900 px-1.5 py-0.5 text-[10px] font-medium text-white">
                      Asosiy
                    </span>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center gap-1 rounded-lg bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                    {!img.is_main && (
                      <button
                        type="button"
                        onClick={() => handleSetMainImage(img.id)}
                        title="Asosiy qilish"
                        className="flex h-7 w-7 items-center justify-center rounded-md bg-white text-slate-700"
                      >
                        <Eye size={13} />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDeleteImage(img.id)}
                      title="O‘chirish"
                      className="flex h-7 w-7 items-center justify-center rounded-md bg-white text-red-600"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}