import axiosClient from "../axiosClient";

// ✅ IMPORTANT: same name everywhere
export const getRidersApi= async () => {
  const res = await axiosClient.get("/admin/riders");
  return res.data;
};

export const createRiderApi = async (data) => {
  const res = await axiosClient.post("/admin/riders", data);
  return res.data;
};

export const updateRiderApi = async (id, data) => {
  const res = await axiosClient.put(`/admin/riders/${id}`, data);
  return res.data;
};


