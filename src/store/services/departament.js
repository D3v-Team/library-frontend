import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "../baseQuary/axiosBaseQuery";

/**
 * Departament endpointi `multipart/form-data` qabul qiladi
 * (Swagger: CreateDepartmentDto / UpdateDepartmentDto).
 *
 * `member_photo` FAQAT haqiqiy File bo'lganda qo'shiladi. Aks holda
 * tahrirlashda admin yangi rasm tanlamagan bo'lsa ham bo'sh qiymat
 * yuborilib, mavjud surat o'chib ketardi.
 *
 * Suratni butunlay olib tashlash uchun alohida endpoint bor:
 * DELETE /departments/:id/remove-photo
 */
function toFormData(fields) {
  const formData = new FormData();

  Object.entries(fields).forEach(([key, value]) => {
    if (value === undefined || value === null) return;

    if (key === "member_photo") {
      if (value instanceof File) formData.append(key, value);
      return;
    }

    formData.append(key, value);
  });

  return formData;
}

export const departmentsApi = createApi({
  reducerPath: "departmentsApi",

  baseQuery: axiosBaseQuery(),

  tagTypes: ["Departments"],

  endpoints: (builder) => ({
    // GET ALL
    getDepartments: builder.query({
      query: ({
        page = 1,
        limit = 10,
        search = "",
        sortBy = "",
        sortOrder = "desc",
      } = {}) => ({
        url: "/departments",

        method: "GET",

        params: {
          page,
          limit,
          search,
          sortBy,
          sortOrder,
        },
      }),

      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map((item) => ({
                type: "Departments",
                id: item.id,
              })),

              {
                type: "Departments",
                id: "LIST",
              },
            ]
          : [
              {
                type: "Departments",
                id: "LIST",
              },
            ],
    }),

    // GET BY ID

    getDepartmentById: builder.query({
      query: (id) => ({
        url: `/departments/${id}`,

        method: "GET",
      }),

      providesTags: (result, error, id) => [
        {
          type: "Departments",
          id,
        },
      ],
    }),

    // CREATE

    createDepartment: builder.mutation({
      query: (data) => ({
        url: "/departments",

        method: "POST",

        data: toFormData(data),
      }),

      invalidatesTags: [
        {
          type: "Departments",
          id: "LIST",
        },
      ],
    }),

    // UPDATE

    updateDepartment: builder.mutation({
      query: ({ id, data }) => ({
        url: `/departments/${id}`,

        method: "PATCH",

        data: toFormData(data),
      }),

      invalidatesTags: (result, error, { id }) => [
        {
          type: "Departments",
          id,
        },

        {
          type: "Departments",
          id: "LIST",
        },
      ],
    }),

    // REMOVE PHOTO

    removeDepartmentPhoto: builder.mutation({
      query: (id) => ({
        url: `/departments/${id}/remove-photo`,

        method: "DELETE",
      }),

      invalidatesTags: (result, error, id) => [
        {
          type: "Departments",
          id,
        },

        {
          type: "Departments",
          id: "LIST",
        },
      ],
    }),

    // DELETE

    deleteDepartment: builder.mutation({
      query: (id) => ({
        url: `/departments/${id}`,

        method: "DELETE",
      }),

      invalidatesTags: [
        {
          type: "Departments",
          id: "LIST",
        },
      ],
    }),
  }),
});

export const {
  useGetDepartmentsQuery,

  useGetDepartmentByIdQuery,

  useCreateDepartmentMutation,

  useUpdateDepartmentMutation,

  useDeleteDepartmentMutation,

  useRemoveDepartmentPhotoMutation,
} = departmentsApi;
