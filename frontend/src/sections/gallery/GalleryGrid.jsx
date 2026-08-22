import { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { GALLERY_CATEGORIES } from '@features/hotel/gallery/categories';
import { useGalleryPage } from '@lib/queries/useGalleryPage';
import Reveal from '@components/ui/Reveal';
import styles from './GalleryGrid.module.css';

export default function GalleryGrid() {
  const { data } = useGalleryPage();
  const { images: galleryImages } = data;
  const [activeCategory, setActiveCategory] = useState('all');
  const [lightboxIndex, setLightboxIndex] = useState(null);

  const filtered =
    activeCategory === 'all'
      ? galleryImages
      : galleryImages.filter((img) => img.category === activeCategory);

  const openLightbox = (index) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);
  const showNext = () => setLightboxIndex((i) => (i + 1) % filtered.length);
  const showPrev = () => setLightboxIndex((i) => (i - 1 + filtered.length) % filtered.length);

  const handleFilterChange = (categoryId) => {
    setActiveCategory(categoryId);
    setLightboxIndex(null);
  };

  return (
    <section className={styles.section}>
      <div className="container">
        <Reveal className={styles.filters} role="tablist" aria-label="Filter gallery by category">
          {GALLERY_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              role="tab"
              aria-selected={activeCategory === cat.id}
              className={`${styles.filterBtn} ${
                activeCategory === cat.id ? styles.filterBtnActive : ''
              }`}
              onClick={() => handleFilterChange(cat.id)}
            >
              {cat.label}
            </button>
          ))}
        </Reveal>

        <div className={styles.masonry}>
          {filtered.map((img, i) => (
            <Reveal key={`${activeCategory}-${img.id}`} delay={(i % 8) * 60}>
              <button
                type="button"
                className={`${styles.tile} ${styles[`aspect${capitalize(img.aspect || 'square')}`]}`}
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
        {filtered.length === 0 && (
          <p className={styles.empty}>No photos in this category yet.</p>
        )}
      </div>

      {lightboxIndex !== null && (
        <GalleryLightbox
          images={filtered}
          activeIndex={lightboxIndex}
          onClose={closeLightbox}
          onNext={showNext}
          onPrev={showPrev}
        />
      )}
    </section>
  );
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
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