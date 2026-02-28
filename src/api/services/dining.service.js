import axiosClient from "@/api/axiosClient";

export const getCategories = async () => {
  const res = await axiosClient.get("/admin/dining/categories");
  return res?.data?.data ?? [];
};

export const getCategoryById = async (id) => {
  const res = await axiosClient.get(`/admin/dining/categories/${id}`);
  return res?.data?.data;
};

export const createCategory = async (formData) => {
  // formData pehle se hi component mein ban chuka hai
  const res = await axiosClient.post("/admin/dining/categories", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res?.data?.data;
};

export const updateCategory = async ({ id, payload }) => {
  // payload yahan par formData hai
  const res = await axiosClient.patch(`/admin/dining/categories/${id}`, payload, {
    headers: { "Content-Type": "multipart/form-data" },
  });
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