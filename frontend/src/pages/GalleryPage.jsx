import { useGalleryPage } from '@lib/queries/useGalleryPage'
import PageLoader from '@components/ui/PageLoader'
import GalleryHero from '@sections/gallery/GalleryHero'
import GalleryGrid from '@sections/gallery/GalleryGrid'

export default function GalleryPage() {
  const { isLoading, isError } = useGalleryPage()

  if (isLoading) return <PageLoader />
  if (isError) {
    return (
      <div role="alert" style={{ padding: '3rem', textAlign: 'center' }}>
        Couldn't load this page. Please refresh, or try again shortly.
      </div>
    )
  }

  return (
    <>
      <GalleryHero />
      <GalleryGrid />
    </>
  )
}
