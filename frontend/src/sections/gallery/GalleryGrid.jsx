import { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useGalleryPage } from '@lib/queries/useGalleryPage';
import Reveal from '@components/ui/Reveal';
import styles from './GalleryGrid.module.css';

const PAGE_SIZE = 15;

export default function GalleryGrid() {
  const { data } = useGalleryPage();
  const images = data.images || [];
  const [page, setPage] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState(null);

  const pageCount = Math.max(1, Math.ceil(images.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount - 1);
  const start = currentPage * PAGE_SIZE;
  const visible = images.slice(start, start + PAGE_SIZE);

  const openLightbox = (index) => setLightboxIndex(start + index);
  const closeLightbox = () => setLightboxIndex(null);
  const showNext = () => setLightboxIndex((i) => (i + 1) % images.length);
  const showPrev = () => setLightboxIndex((i) => (i - 1 + images.length) % images.length);

  function goToPage(next) {
    setPage(next);
    setLightboxIndex(null);
  }

  return (
    <section className={styles.section}>
      <div className="container">
        <div className={styles.grid}>
          {visible.map((img, i) => (
            <Reveal key={img.id} delay={(i % 3) * 60}>
              <button
                type="button"
                className={styles.tile}
                style={{ backgroundImage: `url(${img.image})` }}
                onClick={() => openLightbox(i)}
                aria-label={`Open photo: ${img.caption}`}
              >
                <span className={styles.tileOverlay} />
                <span className={styles.tileCaption}>{img.caption}</span>
              </button>
            </Reveal>
          ))}
        </div>
        {images.length === 0 && <p className={styles.empty}>No photos yet.</p>}
        {pageCount > 1 && (
          <nav className={styles.pager} aria-label="Gallery pages">
            <button type="button" onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 0}>
              Previous
            </button>
            {Array.from({ length: pageCount }, (_, index) => (
              <button
                key={index}
                type="button"
                aria-current={index === currentPage ? 'page' : undefined}
                className={index === currentPage ? styles.pageActive : undefined}
                onClick={() => goToPage(index)}
              >
                {index + 1}
              </button>
            ))}
            <button
              type="button"
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === pageCount - 1}
            >
              Next
            </button>
          </nav>
        )}
      </div>

      {lightboxIndex !== null && (
        <GalleryLightbox
          images={images}
          activeIndex={lightboxIndex}
          onClose={closeLightbox}
          onNext={showNext}
          onPrev={showPrev}
        />
      )}
    </section>
  );
}

function GalleryLightbox({ images, activeIndex, onClose, onNext, onPrev }) {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') onNext();
      if (e.key === 'ArrowLeft') onPrev();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose, onNext, onPrev]);

  return (
    <div className={styles.lightboxOverlay} onClick={onClose}>
      <button
        type="button"
        className={styles.lightboxClose}
        onClick={onClose}
        aria-label="Close gallery"
      >
        <X size={22} />
      </button>

      <button
        type="button"
        className={`${styles.lightboxArrow} ${styles.lightboxPrev}`}
        onClick={(e) => {
          e.stopPropagation();
          onPrev();
        }}
        aria-label="Previous photo"
      >
        <ChevronLeft size={22} />
      </button>

      <div className={styles.lightboxStage} onClick={(e) => e.stopPropagation()}>
        {images.map((img, i) => (
          <div
            key={img.id}
            className={`${styles.lightboxImage} ${
              i === activeIndex ? styles.lightboxImageActive : ''
            }`}
            style={{ backgroundImage: `url(${img.image})` }}
          />
        ))}
        <p className={styles.lightboxCaption}>{images[activeIndex].caption}</p>
      </div>

      <button
        type="button"
        className={`${styles.lightboxArrow} ${styles.lightboxNext}`}
        onClick={(e) => {
          e.stopPropagation();
          onNext();
        }}
        aria-label="Next photo"
      >
        <ChevronRight size={22} />
      </button>
    </div>
  );
}