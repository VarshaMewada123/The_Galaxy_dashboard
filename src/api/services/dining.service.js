import axiosClient from "@/api/axiosClient";

export const getCategories = async () => {
  const res = await axiosClient.get("/admin/dining/categories");
  return res?.data?.data ?? [];
};

export const getCategoryById = async (id) => {
  const res = await axiosClient.get(`/admin/dining/categories/${id}`);
  return res?.data?.data;
};

export const createCategory = async (payload) => {
  const formData = new FormData();

  formData.append("name", payload.name);
  if (payload.description) formData.append("description", payload.description);

  if (payload.sortOrder !== undefined)
    formData.append("sortOrder", payload.sortOrder);

  if (payload.image instanceof File) {
    formData.append("image", payload.image);
  }

  const res = await axiosClient.post("/admin/dining/categories", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return res?.data?.data;
};

export const updateCategory = async ({ id, payload }) => {
  const formData = new FormData();

  if (payload.name) formData.append("name", payload.name);

  if (payload.description !== undefined)
    formData.append("description", payload.description);

  if (payload.sortOrder !== undefined)
    formData.append("sortOrder", payload.sortOrder);

  if (payload.image instanceof File) {
    formData.append("image", payload.image);
  }

  const res = await axiosClient.patch(
    `/admin/dining/categories/${id}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );

  return res?.data?.data;
};

export const deleteCategory = async (id) => {
  const res = await axiosClient.delete(`/admin/dining/categories/${id}`);
  return res?.data;
};

export const toggleAvailability = async (id) => {
  const res = await axiosClient.patch(`/admin/dining/menu/${id}/availability`);

  return res?.data?.data;
};

export const getMenuItems = async () => {
  const res = await axiosClient.get("/admin/dining/menu");
  return res?.data?.data ?? [];
};

export const createMenuItem = async (formData) => {
  const res = await axiosClient.post("/admin/dining/menu", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res?.data?.data;
};

export const deleteMenuItem = async (id) => {
  const res = await axiosClient.delete(`/admin/dining/menu/${id}`);
  return res?.data;
};
