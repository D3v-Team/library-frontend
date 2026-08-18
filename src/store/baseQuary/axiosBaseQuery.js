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
      });

      return {
        data: result.data,
      };
    } catch (error) {
      return {
        error: {
          status: error.response?.status,
          data: error.response?.data || {
            message: error.message,
          },
        },
      };
    }
  };
