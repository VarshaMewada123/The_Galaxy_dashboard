/* eslint-disable no-undef */


export const getOrders = async () => {
  const res = await axiosClient.get("/admin/orders");
  return res.data;
};

export const updateOrderStatus = ({ id, status }) => {
  return axiosClient.patch(`/admin/orders/${id}/status`, { status });
};

export const assignRider = ({ id, riderId }) => {
  return axiosClient.patch(`/admin/orders/${id}/assign-rider`, {
    riderId,
  });
};