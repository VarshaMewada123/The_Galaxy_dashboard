import axios from "axios";

const API = "http://localhost:5000/api/rooms";

export const getRooms = async () => {
  const res = await axios.get(API);
  return res.data.data;
};

export const createRoom = async (formData) => {
  const res = await axios.post(API, formData);
  return res.data.data;
};

export const updateRoom = async ({ id, formData }) => {
  const res = await axios.put(`${API}/${id}`, formData);
  return res.data.data;
};

export const deleteRoom = async (id) => {
  const res = await axios.delete(`${API}/${id}`);
  return res.data;
};