import React, { useState, useEffect } from 'react';

// Curated Neo-Tokyo / Japanese theme Unsplash images
const BACKGROUND_IMAGES = {
  all: [
    'https://images.unsplash.com/photo-1542931287-023b922fa89b?q=80&w=2560&auto=format&fit=crop', // Tokyo Neon Streets
    'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?q=80&w=2560&auto=format&fit=crop', // Tokyo City Night
    'https://images.unsplash.com/photo-1528360983277-13d401cdc186?q=80&w=2560&auto=format&fit=crop', // Japanese Temple/Sakura
  ],
  football: [
    'https://images.unsplash.com/photo-1522778119026-d647f0596c20?q=80&w=2560&auto=format&fit=crop', // Dramatic Stadium (Blue Lock vibe)
    'https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?q=80&w=2560&auto=format&fit=crop', // Dark Soccer field
  ],
  f1: [
    'https://images.unsplash.com/photo-1511674488667-160a2b02cd49?q=80&w=2560&auto=format&fit=crop', // Highway lights (Cyberpunk speed)
    'https://images.unsplash.com/photo-1614200187524-dc4b892acf16?q=80&w=2560&auto=format&fit=crop', // Racing focus
  ],
  cricket: [
    'https://images.unsplash.com/photo-1499591934245-40b55745b905?q=80&w=2560&auto=format&fit=crop', // Sunset landscape
    'https://images.unsplash.com/photo-1531415074968-036ba1b575da?q=80&w=2560&auto=format&fit=crop', // Dark moody cricket field
  ]
};

const DynamicBackground = ({ activeSport }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [nextImageIndex, setNextImageIndex] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [prevSport, setPrevSport] = useState(activeSport);

  const images = BACKGROUND_IMAGES[activeSport] || BACKGROUND_IMAGES['all'];

  // Reset index when sport changes (update state during render)
  if (activeSport !== prevSport) {
    setPrevSport(activeSport);
    setCurrentImageIndex(0);
    setNextImageIndex(images.length > 1 ? 1 : 0);
  }

  // Handle crossfade interval
  useEffect(() => {
    if (images.length <= 1) return;

    const intervalId = setInterval(() => {
      setIsTransitioning(true);

      setTimeout(() => {
        setCurrentImageIndex(nextImageIndex);
        setNextImageIndex((nextImageIndex + 1) % images.length);
        setIsTransitioning(false);
      }, 1500); // 1.5s matches the CSS transition duration
      
    }, 6000); // Change image every 6 seconds

    return () => clearInterval(intervalId);
  }, [nextImageIndex, images.length]);

  return (
    <div className="dynamic-background-container">
      {/* Base Layer */}
      <div 
        className="dynamic-bg-layer"
        style={{ backgroundImage: `url(${images[currentImageIndex]})` }}
      />
      
      {/* Fading Top Layer */}
      <div 
        className={`dynamic-bg-layer ${isTransitioning ? 'fade-in' : 'fade-out'}`}
        style={{ 
          backgroundImage: `url(${images[nextImageIndex]})`,
          opacity: isTransitioning ? 1 : 0
        }}
      />

      {/* Dark Overlay for readability */}
      <div className="dynamic-bg-overlay" />
    </div>
  );
};

export default DynamicBackground;
