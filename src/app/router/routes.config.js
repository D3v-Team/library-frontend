import { lazy } from "react";
// import { ROLES } from '../permissions/roles';

export const ROUTES = [
  {
    path: "/login",
    component: lazy(() => import("../../Components/Common/Login")),
    roles: null,
  },
  {
    path: "/",
    component: lazy(() => import("../../Pages/Home/Home.jsx")),
    roles: null,
  },

  // --- About ---
  {
    path: "/about",
    component: lazy(() => import("../../Pages/About/About.jsx")),
    roles: null,
  },
  {
    path: "/about/history",
    component: lazy(() => import("../../Pages/About/History.jsx")),
    roles: null,
  },
  {
    path: "/about/regulations",
    component: lazy(() => import("../../Pages/About/Regulations.jsx")),
    roles: null,
  },
  {
    path: "/about/management",
    component: lazy(() => import("../../Pages/About/Management.jsx")),
    roles: null,
  },
  {
    path: "/about/structure",
    component: lazy(() => import("../../Pages/About/Structure.jsx")),
    roles: null,
  },
  {
    path: "/about/departments",
    component: lazy(() => import("../../Pages/About/Departments.jsx")),
    roles: null,
  },
  {
    path: "/about/staff",
    component: lazy(() => import("../../Pages/About/Staff.jsx")),
    roles: null,
  },

  // --- Books ---
  {
    path: "/books",
    component: lazy(() => import("../../Pages/Books/Books.jsx")),
    roles: null,
  },
  {
    path: "/books/new",
    component: lazy(() => import("../../Pages/Books/Books.jsx")),
    roles: null,
  },
  {
    path: "/books/:id",
    component: lazy(() => import("../../Pages/Books/BookDetail.jsx")),
    roles: null,
  },

  // --- News ---
  {
    path: "/news",
    component: lazy(() => import("../../Pages/News/News.jsx")),
    roles: null,
  },
  {
    path: "/news/:id",
    component: lazy(() => import("../../Pages/News/NewsDetail.jsx")),
    roles: null,
  },

  // --- Events ---
  {
    path: "/events",
    component: lazy(() => import("../../Pages/Events/Events.jsx")),
    roles: null,
  },
  {
    path: "/events/:id",
    component: lazy(() => import("../../Pages/Events/EventDetail.jsx")),
    roles: null,
  },

  // --- Catalog ---
  {
    path: "/catalog",
    component: lazy(() => import("../../Pages/Catalog/Catalog.jsx")),
    roles: null,
  },
  {
    path: "/catalog/:id",
    component: lazy(() => import("../../Pages/Catalog/CatalogDetail.jsx")),
    roles: null,
  },

  // --- Library ---
  {
    path: "/library",
    component: lazy(() => import("../../Pages/Library/Library.jsx")),
    roles: null,
  },
 
  { 
    path: "/library/:id",
    component: lazy(() => import("../../Pages/Library/LibraryDetail.jsx")),
    roles: null,
  },

  // --- Services ---
  {
    path: "/services",
    component: lazy(() => import("../../Pages/Services/Services.jsx")),
    roles: null,
  },
  {
    path: "/services/order",
    component: lazy(() => import("../../Pages/Services/Order.jsx")),
    roles: null,
  },
  {
    path: "/services/appeal",
    component: lazy(() => import("../../Pages/Services/Appeal.jsx")),
    roles: null,
  },
  {
    path: "/services/faq",
    component: lazy(() => import("../../Pages/Services/FAQ.jsx")),
    roles: null,
  },
  {
    path: "/services/reference",
    component: lazy(() => import("../../Pages/Services/Reference.jsx")),
    roles: null,
  },

  // --- Media ---
  {
    path: "/media",
    component: lazy(() => import("../../Pages/Media/Media.jsx")),
    roles: null,
  },
  {
    path: "/media/photos",
    component: lazy(() => import("../../Pages/Media/Photos.jsx")),
    roles: null,
  },
  {
    path: "/media/videos",
    component: lazy(() => import("../../Pages/Media/Videos.jsx")),
    roles: null,
  },
  {
    path: "/media/presentations",
    component: lazy(() => import("../../Pages/Media/Presentations.jsx")),
    roles: null,
  },

  // --- Documents ---
  {
    path: "/about/documents",
    component: lazy(() => import("../../Pages/Documents/Documents.jsx")),
    roles: null,
  },
  {
    path: "/documents/laws",
    component: lazy(() => import("../../Pages/Documents/Laws.jsx")),
    roles: null,
  },
  {
    path: "/documents/decisions",
    component: lazy(() => import("../../Pages/Documents/Decisions.jsx")),
    roles: null,
  },
  {
    path: "/documents/orders",
    component: lazy(() => import("../../Pages/Documents/Orders.jsx")),
    roles: null,
  },
  {
    path: "/documents/reports",
    component: lazy(() => import("../../Pages/Documents/Reports.jsx")),
    roles: null,
  },

  // --- Contact ---
  {
    path: "/contact",
    component: lazy(() => import("../../Pages/Contact/Contact.jsx")),
    roles: null,
  },

  {
    path: "/403",
    component: lazy(() => import("../../Pages/Forbidden/Forbidden.jsx")),
    roles: null,
  },

  // --- 404 (catch-all, must stay last) ---
  {
    path: "*",
    component: lazy(() => import("../../Pages/NotFound/NotFound.jsx")),
    roles: null,
  },
];

// Admin routes are intentionally kept in their own array instead of being
// merged into ROUTES above. AppRouter renders this list inside the admin
// layout (Sidebar + content), separately from the public PublicLayout
// group, so public and admin routing never mix.
//
// roles must match exactly what the backend returns in `user.role` (see
// ALLOWED_ROLES in Components/Common/Login/index.jsx) — NOT the lowercase
// values in app/permissions/roles.js, which belong to a different,
// currently-unused menu system.
const ADMIN_ROLES = ["ADMIN", "SUPER_ADMIN"];

export const ADMIN_ROUTES = [
  {
    path: "/admin",
    component: lazy(() => import("../../Pages/Admin/Dashboard.jsx")),
    roles: ADMIN_ROLES,
  },
  
  {
    path: "/admin/news",
    component: lazy(() => import("../../Pages/Admin/News.jsx")),
    roles: ADMIN_ROLES,
  },
  {
    path: "/admin/books",
    component: lazy(() => import("../../Pages/Admin/Books.jsx")),
    roles: ADMIN_ROLES,
  },
  {
    path: "/admin/books/:id",
    component: lazy(() => import("../../Pages/Admin/BookDetail.jsx")),
    roles: ADMIN_ROLES,
  },
  {
    path: "/admin/genres",
    component: lazy(() => import("../../Pages/Admin/Genres.jsx")),
    roles: ADMIN_ROLES,
  },
  {
    path: "/admin/events",
    component: lazy(() => import("../../Pages/Admin/Events.jsx")),
    roles: ADMIN_ROLES,
  },
   {
    path: "/admin/management",
    component: lazy(() => import("../../Pages/Admin/Departament.jsx")),
    roles: ADMIN_ROLES,
  },
  {
    path: "/admin/media",
    component: lazy(() => import("../../Pages/Admin/Media.jsx")),
    roles: ADMIN_ROLES,
  },
  {
    path: "/admin/avtors",
    component: lazy(() => import("../../Pages/Admin/Avtors.jsx")),
    roles: ADMIN_ROLES,
  },
  {
    path: "/admin/announcements",
    component: lazy(() => import("../../Pages/Admin/Announcements.jsx")),
    roles: ADMIN_ROLES,
  },
  {
    path: "/admin/banners",
    component: lazy(() => import("../../Pages/Admin/Banners.jsx")),
    roles: ADMIN_ROLES,
  },
  {
    path: "/admin/documents",
    component: lazy(() => import("../../Pages/Admin/Documents.jsx")),
    roles: ADMIN_ROLES,
  },
  {
    path: "/admin/links",
    component: lazy(() => import("../../Pages/Admin/Links")),
    roles: ADMIN_ROLES,
  },
  {
    path: "/admin/contactinfo",
    component: lazy(() => import("../../Pages/Admin/ContactInfo.jsx")),
    roles: ADMIN_ROLES,
  },
  {
    path: "/admin/message",
    component: lazy(() => import("../../Pages/Admin/Message.jsx")),
    roles: ADMIN_ROLES,
  },
  {
    path: "/admin/users",
    component: lazy(() => import("../../Pages/Admin//Users")),
    roles: ADMIN_ROLES,
  },
];

