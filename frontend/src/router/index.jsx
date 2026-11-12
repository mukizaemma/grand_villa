import { createBrowserRouter, Navigate, useParams } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import PageLoader from '@components/ui/PageLoader'
import Layout from '@components/layout/Layout'

const HomePage          = lazy(() => import('@pages/HomePage'))
const RoomsPage         = lazy(() => import('@pages/RoomsPage'))
const RoomDetailPage    = lazy(() => import('@pages/RoomDetailPage'))
const BarRestaurantPage = lazy(() => import('@pages/BarRestaurantPage'))
const GalleryPage       = lazy(() => import('@pages/GalleryPage'))
const AboutPage         = lazy(() => import('@pages/AboutPage'))
const ContactPage       = lazy(() => import('@pages/ContactPage'))
const BookingPage       = lazy(() => import('@pages/BookingPage'))
const PolicyPage        = lazy(() => import('@pages/PolicyPage'))
const ThingsToDoPage    = lazy(() => import('@pages/ThingsToDoPage'))
const HandoverPage      = lazy(() => import('@pages/HandoverPage'))
const JoinPage          = lazy(() => import('@pages/JoinPage'))
const NotFoundPage      = lazy(() => import('@pages/NotFoundPage'))
const StaffRoot         = lazy(() => import('@features/staff/StaffRoot'))
const StaffLayout       = lazy(() => import('@features/staff/layout/StaffLayout'))
const StaffLoginPage    = lazy(() => import('@features/staff/pages/StaffLoginPage'))
const StaffForgotPage   = lazy(() => import('@features/staff/pages/StaffForgotPage'))
const StaffResetPage    = lazy(() => import('@features/staff/pages/StaffResetPage'))
const StaffDashboard    = lazy(() => import('@features/staff/pages/StaffDashboard'))
const StaffReservations = lazy(() => import('@features/staff/pages/StaffReservations'))
const StaffAvailability = lazy(() => import('@features/staff/pages/StaffAvailability'))
const StaffRooms        = lazy(() => import('@features/staff/pages/StaffRooms'))
const StaffExperiences  = lazy(() => import('@features/staff/pages/StaffExperiences'))
const StaffGallery      = lazy(() => import('@features/staff/pages/StaffGallery'))
const StaffPages        = lazy(() => import('@features/staff/pages/StaffPages'))
const StaffMedia        = lazy(() => import('@features/staff/pages/StaffMedia'))
const StaffSettings     = lazy(() => import('@features/staff/pages/StaffSettings'))
const StaffAmenities    = lazy(() => import('@features/staff/pages/StaffAmenities'))
const StaffMenuItems    = lazy(() => import('@features/staff/pages/StaffMenuItems'))
const StaffAudit        = lazy(() => import('@features/staff/pages/StaffAudit'))
const StaffGuide        = lazy(() => import('@features/staff/pages/StaffGuide'))
const StaffAccount      = lazy(() => import('@features/staff/pages/StaffAccount'))
const StaffUsers        = lazy(() => import('@features/staff/pages/StaffUsers'))

// Wraps a lazy component in Suspense — called inline in route elements
const Wrap = ({ Component }) => (
  <Suspense fallback={<PageLoader />}>
    <Component />
  </Suspense>
)

function RoomRedirect() {
  const { roomId } = useParams()
  return <Navigate to={`/accommodation/${roomId}`} replace />
}

const router = createBrowserRouter([
  {
    path: '/staff',
    element: <Wrap Component={StaffRoot} />,
    children: [
      { path: 'login', element: <Wrap Component={StaffLoginPage} /> },
      { path: 'forgot', element: <Wrap Component={StaffForgotPage} /> },
      { path: 'reset/:token', element: <Wrap Component={StaffResetPage} /> },
      {
        element: <Wrap Component={StaffLayout} />,
        children: [
          { index: true, element: <Wrap Component={StaffDashboard} /> },
          { path: 'reservations', element: <Wrap Component={StaffReservations} /> },
          { path: 'availability', element: <Wrap Component={StaffAvailability} /> },
          { path: 'accommodation', element: <Wrap Component={StaffRooms} /> },
          { path: 'rooms', element: <Navigate to="/staff/accommodation" replace /> },
          { path: 'things-to-do', element: <Wrap Component={StaffExperiences} /> },
          { path: 'experiences', element: <Navigate to="/staff/things-to-do" replace /> },
          { path: 'gallery', element: <Wrap Component={StaffGallery} /> },
          { path: 'media', element: <Wrap Component={StaffMedia} /> },
          { path: 'pages', element: <Wrap Component={StaffPages} /> },
          { path: 'settings', element: <Wrap Component={StaffSettings} /> },
          { path: 'amenities', element: <Wrap Component={StaffAmenities} /> },
          { path: 'menu', element: <Wrap Component={StaffMenuItems} /> },
          { path: 'audit', element: <Wrap Component={StaffAudit} /> },
          { path: 'guide', element: <Wrap Component={StaffGuide} /> },
          { path: 'users', element: <Wrap Component={StaffUsers} /> },
          { path: 'account', element: <Wrap Component={StaffAccount} /> },
        ],
      },
    ],
  },
  {
    path: '/',
    element: <Layout hasHero={true} />,
    children: [
      { index: true, element: <Wrap Component={HomePage} /> },
      { path: 'accommodation', element: <Wrap Component={RoomsPage} /> },
      { path: 'bar-restaurant', element: <Wrap Component={BarRestaurantPage} /> },
      { path: 'things-to-do', element: <Wrap Component={ThingsToDoPage} /> },
      { path: 'gallery', element: <Wrap Component={GalleryPage} /> },
      { path: 'about', element: <Wrap Component={AboutPage} /> },
      { path: 'contact', element: <Wrap Component={ContactPage} /> },
    ],
  },
  {
    path: '/handover/:section?',
    element: <Wrap Component={HandoverPage} />,
  },
  {
    path: '/join',
    element: <Wrap Component={JoinPage} />,
  },
  {
    path: '/',
    element: <Layout hasHero={false} />,
    children: [
      { path: 'accommodation/:roomId', element: <Wrap Component={RoomDetailPage} /> },
      { path: 'rooms', element: <Navigate to="/accommodation" replace /> },
      { path: 'rooms/:roomId', element: <RoomRedirect /> },
      { path: 'book', element: <Wrap Component={BookingPage} /> },
      { path: 'policy', element: <Wrap Component={PolicyPage} /> },
      { path: '*', element: <Wrap Component={NotFoundPage} /> },
    ],
  },
], {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true,
  },
})

export default router
