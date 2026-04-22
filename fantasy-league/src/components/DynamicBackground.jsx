import React, { useState, useEffect } from 'react';

// Curated high-resolution Unsplash images for each sport
const BACKGROUND_IMAGES = {
  all: [
    'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=2560&auto=format&fit=crop', // Generic Stadium
    'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=2560&auto=format&fit=crop', // Football
    'https://images.unsplash.com/photo-1538501111663-ea0e2dc92b15?q=80&w=2560&auto=format&fit=crop', // F1
    'https://images.unsplash.com/photo-1531415074968-036ba1b575da?q=80&w=2560&auto=format&fit=crop'  // Cricket
  ],
  football: [
    'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=2560&auto=format&fit=crop', // Stadium
    'https://images.unsplash.com/photo-1518605368461-1eb24608c5c7?q=80&w=2560&auto=format&fit=crop', // Pitch lines
    'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=2560&auto=format&fit=crop', // Ball on grass
    'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?q=80&w=2560&auto=format&fit=crop'  // Floodlights
  ],
  f1: [
    'https://images.unsplash.com/photo-1538501111663-ea0e2dc92b15?q=80&w=2560&auto=format&fit=crop', // F1 Car Track
    'https://images.unsplash.com/photo-1614200179396-2bdb77ebf81b?q=80&w=2560&auto=format&fit=crop', // F1 Race Start
    'https://images.unsplash.com/photo-1507503741692-a1690045e0c5?q=80&w=2560&auto=format&fit=crop', // F1 Engine/Wheel close
    'https://images.unsplash.com/photo-1555597673-b21d5c935865?q=80&w=2560&auto=format&fit=crop'  // Speed blur
  ],
  cricket: [
    'https://images.unsplash.com/photo-1531415074968-036ba1b575da?q=80&w=2560&auto=format&fit=crop', // Cricket Pitch
    'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=2560&auto=format&fit=crop', // Stadium Crowd
    'https://images.unsplash.com/photo-1607734834519-d8576ae60ea6?q=80&w=2560&auto=format&fit=crop', // Bat and Ball
    'https://images.unsplash.com/photo-1624526267942-ab0f0b580898?q=80&w=2560&auto=format&fit=crop'  // Cricket Match Action
  ],
  hackathon: [
    'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=2560&auto=format&fit=crop', // Code Screen
    'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2560&auto=format&fit=crop', // Team working
    'https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=2560&auto=format&fit=crop'  // Laptop setup
  ]
};

const DynamicBackground = ({ activeSport }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [nextImageIndex, setNextImageIndex] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const images = BACKGROUND_IMAGES[activeSport] || BACKGROUND_IMAGES['all'];

  // Reset index when sport changes
  useEffect(() => {
    setCurrentImageIndex(0);
    setNextImageIndex(images.length > 1 ? 1 : 0);
  }, [activeSport, images.length]);

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
