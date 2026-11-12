export const HANDOVER_TABS = [
  { id: 'overview', label: 'What was built' },
  { id: 'guide', label: 'User guide' },
  { id: 'access', label: 'Sign in' },
  { id: 'accounts', label: 'Accounts' },
  { id: 'settings', label: 'Site setting' },
  { id: 'pages', label: 'Pages' },
  { id: 'rooms', label: 'Rooms' },
  { id: 'amenities', label: 'Facilities' },
  { id: 'menu', label: 'Menu items' },
  { id: 'gallery', label: 'Gallery & media' },
  { id: 'bookings', label: 'Bookings' },
  { id: 'hosting', label: 'Hosting' },
  { id: 'audit', label: 'Site audit' },
  { id: 'feedback', label: 'Send feedback' },
]

export const HANDOVER_SECTIONS = {
  overview: {
    title: 'What was built',
    lead: 'Grand Villa Apartment now has a public website and a staff desk for day-to-day content. Each topic in this guide is its own page.',
    blocks: [
      {
        heading: 'Public website',
        body: 'Guests can browse rooms, the restaurant, things to do, the gallery, about, contact, and book a stay. They never log in. Payments can go through card or Mobile Money when those services are connected, or they can pay on arrival.',
      },
      {
        heading: 'Staff desk',
        body: 'Use /staff for the property desk: rooms, menu items, pages, photos, amenities, and reservations. Payload admin at /admin is the same content for people who have been granted admin access.',
      },
      {
        heading: 'How to read this guide',
        body: 'Use the list on the left, or Previous and Next at the bottom of each page. The address changes with the page, so a refresh stays where you were.',
      },
    ],
  },
  guide: {
    title: 'User guide',
    lead: 'Signed-in users manage the whole website from the staff desk. Site setting and Users stay with the super admin.',
    blocks: [
      {
        heading: 'Everyday work',
        body: 'Sign in at /staff. The left menu matches the public site: pages, the apartment, bookings, availability, kitchen and bar, menu items, things to do, amenities, and both galleries. Open a page, change the text or photos, and save.',
      },
      {
        heading: 'What every user can change',
        body: 'Room prices and photos, page headlines, the menu, gallery photos, amenities, and booking replies. Your own name and password are under My account.',
      },
      {
        heading: 'What stays with the super admin',
        body: 'Site setting (name, logo, phones, map) and Users (who can sign in, who has admin access) are only for admin@iremetech.com. Other accounts do not see those screens.',
      },
      {
        heading: 'One topic per page',
        body: 'The next pages of this guide walk through each area. Stay on one page, then use Next when you are ready for the following topic.',
      },
    ],
  },
  access: {
    title: 'How to sign in',
    lead: 'Two doors, one property account. The password is never shown on this page.',
    blocks: [
      {
        heading: 'Staff desk',
        body: 'Open /staff and sign in with the email and password for your account. This is the everyday place to change rooms, pages, and photos.',
      },
      {
        heading: 'Admin panel',
        body: 'Open /admin only after the super admin has granted you admin access. Editors use the staff desk. The super admin uses both.',
      },
      {
        heading: 'Password',
        body: 'The first password is chosen when the account is created. This page will not display it. If it is lost, use Forgot password on the login screen — a reset link is emailed to that account.',
      },
    ],
  },
  accounts: {
    title: 'Accounts',
    lead: 'New system users are created on a public page. Admin access is granted afterwards, and only by the super admin.',
    blocks: [
      {
        heading: 'Create an account',
        body: 'Open /join while this handover guide is available. The new account can sign in and edit website content. It is not an admin account.',
      },
      {
        heading: 'Super admin',
        body: 'admin@iremetech.com is the only account that can grant or remove admin access, delete a user, force someone out, or block and allow login. Site setting and the Users page are on that account alone.',
      },
      {
        heading: 'When the guide is turned off',
        body: 'The super admin can hide this guide. While it is unavailable, /join does not accept new accounts.',
      },
    ],
  },
  settings: {
    title: 'Site setting',
    lead: 'Property name, logo, phones, email, map, and search-engine text live in one place. Only the super admin can open it.',
    blocks: [
      {
        heading: 'Where to edit',
        body: 'Staff desk → Site setting, or Admin → Site setting, signed in as admin@iremetech.com. Fill name, logo, phone, WhatsApp, email, address, and a Google Maps link or embed.',
      },
      {
        heading: 'Why it matters',
        body: 'The footer, contact page, and booking messages read from here. Other users manage page content, but they cannot change these property details.',
      },
    ],
  },
  pages: {
    title: 'Website pages',
    lead: 'Each public page has a matching edit screen. Change the header image and headline first — that is what guests see at the top.',
    blocks: [
      {
        heading: 'Home',
        body: 'Hero slides (photo + headline), welcome features, rooms intro, and location copy. Restaurant photos on the home page are edited under Bar & Restaurant → Home page section.',
      },
      {
        heading: 'Other pages',
        body: 'Accommodation, Bar & Restaurant, Things to do, Gallery, About, Contact, Booking, and Booking policy each have their own screen. Keep a header image and headline on every page.',
      },
    ],
  },
  rooms: {
    title: 'Rooms',
    lead: 'A room needs a name, nightly rate, description, main photo, extra photos, bed/occupancy, and in-room amenities.',
    blocks: [
      {
        heading: 'Where to edit',
        body: 'Staff desk → The apartment. Add or edit the listing, then upload a main photo and a few gallery shots. Set the nightly rate and how many guests the apartment takes. Tick the amenities that belong in the stay.',
      },
      {
        heading: 'What guests see',
        body: 'The accommodation list and the apartment page. Missing photos or prices show up on the site audit.',
      },
    ],
  },
  amenities: {
    title: 'Property facilities',
    lead: 'Facilities are property-wide (parking, restaurant, front desk), not the in-room list on the apartment.',
    blocks: [
      {
        heading: 'Where to edit',
        body: 'Staff desk → Amenities. Add a name, short description, and a photo. Aim for at least three published facilities.',
      },
    ],
  },
  menu: {
    title: 'Menu items',
    lead: 'Each dish lives in Menu items, not on the restaurant page form. The page only holds the menu headline.',
    blocks: [
      {
        heading: 'Where to edit',
        body: 'Staff desk → Menu items, or Admin → Menu items. Add a name, price, category, photo, ingredients, and any allergens or dietary tags.',
      },
      {
        heading: 'What guests see',
        body: 'The Bar & Restaurant page shows the dishes in a grid. Details (hover or tap) open ingredients and notes. Guests can add items and send the order on WhatsApp with prices, total, and their notes.',
      },
    ],
  },
  gallery: {
    title: 'Gallery and media',
    lead: 'Media Gallery is the library. Site Gallery is what guests see on /gallery.',
    blocks: [
      {
        heading: 'Upload once, reuse everywhere',
        body: 'Staff desk → Media Gallery to upload. On any page or room, choose an existing file or upload a new one.',
      },
      {
        heading: 'Publish to the gallery page',
        body: 'Open the file and set Gallery category to Rooms, Bar & Restaurant, Property & views, or Amenities. Leave it on None to keep the file in the library only.',
      },
    ],
  },
  bookings: {
    title: 'Bookings',
    lead: 'New reservations appear on the admin home and under Bookings. You can confirm, reply, or take a note on the conversation thread.',
    blocks: [
      {
        heading: 'Daily use',
        body: 'Filter by date, open a booking, and reply on WhatsApp or email — whichever the guest chose. Paste guest replies so the thread stays on that reservation.',
      },
      {
        heading: 'When the property is full',
        body: 'Staff desk → Availability. Close the whole property or selected rooms for a date range. The website stops those bookings. Open the dates again when you can take guests.',
      },
      {
        heading: 'Payments',
        body: 'Card and Mobile Money only work after those accounts are connected. Guests can always choose pay on arrival.',
      },
    ],
  },
  hosting: {
    title: 'Hosting',
    lead: 'The domain and the server are billed once a year. The status below is calculated from the invoice and the date.',
    blocks: [
      {
        heading: 'Where it is registered',
        body: 'The domain is registered on Namecheap. The website is hosted on DigitalOcean. The annual fee is $70, due every 25 October.',
      },
      {
        heading: 'Invoices',
        body: 'The system keeps one invoice per year. The super admin marks each invoice paid, not paid, or suspended. A paid invoice shows Active. From 30 days before 25 October it shows Expiring soon. From 25 October it shows Expired until that year’s invoice is marked paid. Suspended stays suspended until it is changed.',
      },
    ],
  },
  audit: {
    title: 'Site audit',
    lead: 'This score is calculated from live content. It is not a manual checklist.',
    blocks: [
      {
        heading: 'How to use it',
        body: 'Work through anything marked Focus. Open the staff desk link beside the item, add the missing photo or text, then refresh this page. The score updates from the website content itself.',
      },
    ],
  },
  feedback: {
    title: 'Tell us what to improve',
    lead: 'If something is missing, unclear, or should work differently, send a note. It is stored under Handover notes for Ireme.',
    blocks: [],
  },
}
