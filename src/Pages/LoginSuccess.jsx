// import { useEffect } from "react";
// import { useNavigate, useSearchParams } from "react-router-dom";

// const LoginSuccess = () => {
//   const navigate = useNavigate();
//   const [searchParams] = useSearchParams();

//   useEffect(() => {
//     const token = searchParams.get("token");

//     // ❌ No token → kick out
//     if (!token || token.length < 10) {
//       navigate("/", { replace: true });
//       return;
//     }

//     // ✅ Save admin token
//     localStorage.setItem("adminToken", token);

//     // ✅ Redirect to admin dashboard
//     navigate("/admin/dashboard", { replace: true });
//   }, [navigate, searchParams]);

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-50">
//       <p className="text-sm font-medium text-gray-600 animate-pulse">
//         Authorizing admin access…
//       </p>
//     </div>
//   );
// };

// export default LoginSuccess;



import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const LoginSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token || token.length < 10) {
      navigate("/", { replace: true });
      return;
    }

    localStorage.setItem("adminToken", token);
    navigate("/admin/dashboard", { replace: true });
  }, [navigate, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="text-lg font-medium text-gray-600 animate-pulse">
          Authorizing admin access...
        </p>
      </div>
    </div>
  );
};

export default LoginSuccess;
