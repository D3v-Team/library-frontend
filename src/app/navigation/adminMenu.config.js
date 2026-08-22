// navigation/adminMenu.config.js
//
// Separate from sidebar.config.js on purpose: that file already models a
// role-based menu (Users/Settings) for a future auth system. This one is
// the simple, no-auth menu the admin MVP actually uses right now.

import {
  LayoutDashboard,
  GalleryHorizontalEnd,
  Newspaper,
  BookOpen,
  CalendarDays,
  Images,
  Users,
  Users2,
  Megaphone,
  BookAIcon,
  UserSquare,
  FileText,
  Link2Off,
  Link,
  Phone,
  MessageCircleCodeIcon,
  Book,
  Package,
} from 'lucide-react';

export const ADMIN_MENU = [
  {
    label: 'Boshqaruv paneli',
    path: '/admin',
    icon: LayoutDashboard,
    end: true,
  },
  {
    label: 'Bannerlar',
    path: '/admin/banners',
    icon: GalleryHorizontalEnd,
  },
  {
    label: 'E\'lonlar',
    path: '/admin/announcements',
    icon: Megaphone,
  },
  {
    label: 'Mualliflar',
    path: '/admin/avtors',
    icon: Users,
  },
  
  
  {
    label: 'Kitoblar',
    path: '/admin/books',
    icon: BookOpen,
  },
  {
    label: 'Janrlar',
    path: '/admin/genres',
    icon: BookAIcon,
  },
  {
    label: 'Rahbariyat',
    path: '/admin/management',
    icon: UserSquare,
  },
  {
    label: 'Tadbirlar',
    path: '/admin/events',
    icon: CalendarDays,
  },
  {
    label: 'Media',
    path: '/admin/media',
    icon: Images,
  },
  {
    label: 'Hujjatlar',
    path: '/admin/documents',
    icon: FileText,
  },
  {
    label: 'Foydali havolalar',
    path: '/admin/links',
    icon: Link,
  },
  {
    label: 'Aloqa',
    path: '/admin/contactinfo',
    icon: Phone,
  },
  {
    label: 'Sahifalar',
    path: '/admin/pages',
    icon: Package,
  },
  {
    label: 'Xabarlar',
    path: '/admin/message',
    icon: MessageCircleCodeIcon,
  },
  {
    label: 'Buyurtmalar',
    path: '/admin/request',
    icon: Book,
  },
  {
    label: 'Adminlar',
    path: '/admin/users',
    icon: Users2,
  },
];
