// "use client";

// import React, { useEffect, useState } from "react";

// export default function ClientWrapper({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   const [isMounted, setIsMounted] = useState(false);
//   console.log("isMounted:", isMounted);

//   useEffect(() => {
//     if (window) {
//       console.log("useEffect ~ window:", window);
//       // Client-side only code here
//       setIsMounted(true);
//     }
//   }, []);

//   // Only render children when mounted to avoid SSR and hydration errors
//   if (!isMounted) {
//     return null;
//   }

//   return <>{children}</>;
// }
