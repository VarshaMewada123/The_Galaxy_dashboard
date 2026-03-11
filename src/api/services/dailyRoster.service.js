import api from "@/api/axiosClient";

export const upsertDailyRoster = async (payload) => {
  const { data } = await api.post("/admin/roster/dailyroster", payload);
  return data.data;
};

export const getRosterByDate = async (date) => {
  const { data } = await api.get("/admin/roster/getrosterbydate", {
    params: { date },
  });

  return data.data;
};

export const getRosterRange = async ({ start, end }) => {
  const { data } = await api.get("/admin/roster/range", {
    params: { start, end },
  });

  return data.data;
};
