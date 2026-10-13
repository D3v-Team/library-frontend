import $api from "../api";

export const axiosBaseQuery =
  () =>
  async ({ url, method, data, params }) => {
    try {
      const isFormData =
        typeof FormData !== "undefined" && data instanceof FormData;

      const result = await $api({
        url,
        method,
        data,
        params,
        headers: isFormData ? { "Content-Type": undefined } : undefined,
        // Fayl yuklash (rasmlar, Excel import) 30 soniyadan uzoq davom etishi mumkin
        ...(isFormData ? { timeout: 180000 } : {}),
      });

      return {
        data: result.data,
      };
    } catch (error) {
      // Javob umuman kelmagan bo'lsa — RTK Query ning standart holatlari,
      // shunda UI tarmoq xatosini serverdagi xatodan ajrata oladi
      // (Login sahifasi aynan shularni kutadi).
      const status =
        error.response?.status ??
        (error.code === "ECONNABORTED" || error.code === "ETIMEDOUT" ? "TIMEOUT_ERROR" : "FETCH_ERROR");

      return {
        error: {
          status,
          data: error.response?.data || {
            message: error.message,
          },
        },
      };
    }
  };
