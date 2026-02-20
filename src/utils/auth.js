export const getToken = () => localStorage.getItem("adminToken");

export const isAuthenticated = () => !!getToken();

export const logout = () => {
  localStorage.removeItem("adminToken");
  window.location.href = "";
};
