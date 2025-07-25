import Image from "next/image";
import React from "react";
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/autoplay';
import Autoplay from 'swiper';

// SwiperCore.use([Autoplay]); // No es necesario con el import correcto

const brandsData: { id: string; srcUrl: string }[] = [
  {
    id: "Jhonny Walker",
    srcUrl: "/icons/jw.svg",
  },
  {
    id: "Absolut",
    srcUrl: "/icons/absolut.svg",
  },
  {
    id: "Ciroc",
    srcUrl: "/icons/ciroc.svg",
  },
  {
    id: "Chandon",
    srcUrl: "/icons/chandon.svg",
  },
  {
    id: "Gordons",
    srcUrl: "/icons/gordons.svg",
  },
];

const Brands = () => {
  return (
    <div className="bg-[rgb(246,190,103)] w-full">
      {/* Mobile: Slider automático */}
      <div className="block md:hidden py-4">
        <Swiper
          spaceBetween={10}
          slidesPerView={2}
          autoplay={{ delay: 1800, disableOnInteraction: false }}
          loop={true}
          className="w-full max-w-xs mx-auto"
        >
          {brandsData.map((brand) => (
            <SwiperSlide key={brand.id}>
              <div className="flex justify-center items-center">
                <Image
                  priority
                  src={brand.srcUrl}
                  height={40}
                  width={60}
                  alt={brand.id}
                  className="object-contain filter brightness-0 invert"
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
      {/* Desktop: Visualización original */}
      <div className="max-w-frame mx-auto hidden md:flex flex-wrap items-center justify-center md:justify-between py-5 md:py-0 sm:px-4 xl:px-0 space-x-7">
        {brandsData.map((brand) => (
          <Image
            key={brand.id}
            priority
            src={brand.srcUrl}
            height={80}
            width={120}
            alt={brand.id}
            className="object-contain filter brightness-0 invert"
          />
        ))}
      </div>
    </div>
  );
};

export default Brands;
