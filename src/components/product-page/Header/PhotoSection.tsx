"use client";

import { Product } from '@/types/product';
import React, { useState } from "react";
import { PLACEHOLDER_IMAGE } from '@/lib/constants'

const PhotoSection = ({ data }: { data: Product }) => {
  console.log('Datos del producto:', {
    id: data.id,
    name: data.name,
    images: data.images,
    srcUrl: data.srcUrl
  });
  
  // Lista de miniaturas: srcUrl + images, sin duplicados
  const thumbnails = Array.from(new Set([data.srcUrl, ...(data.images || [])].filter(Boolean)));

  const [selected, setSelected] = useState<string>(data.srcUrl);

  return (
    <div className="flex flex-col-reverse lg:flex-row lg:space-x-3.5">
      {/* Galería de miniaturas */}
      <div className="flex lg:flex-col space-x-3 lg:space-x-0 lg:space-y-3.5 w-full lg:w-fit items-center lg:justify-start justify-center min-h-[120px]">
        {thumbnails.map((photo, index) => (
            <button
              key={index}
              type="button"
            className={`bg-[#F0EEED] rounded-[13px] xl:rounded-[20px] w-full max-w-[111px] xl:max-w-[152px] max-h-[106px] xl:max-h-[167px] xl:min-h-[167px] aspect-square overflow-hidden border-2 ${selected === photo ? "border-blue-500" : "border-transparent"}`}
              onClick={() => setSelected(photo)}
            >
            <img
                src={photo}
                width={152}
                height={167}
                className="rounded-md w-full h-full object-cover hover:scale-110 transition-all duration-500"
                alt={data.name}
                onError={(e) => {
                  // @ts-ignore
                  e.target.src = PLACEHOLDER_IMAGE;
                }}
              />
            </button>
          ))}
        </div>

      {/* Imagen principal */}
      <div className="flex items-center justify-center bg-[#F0EEED] rounded-[13px] sm:rounded-[20px] w-auto sm:w-[350px] md:w-[420px] mx-auto h-full max-h-[530px] min-h-[330px] lg:min-h-[380px] xl:min-h-[530px] overflow-hidden mb-3 lg:mb-0">
        <img
          src={selected}
          width={350}
          height={420}
          className="rounded-md h-full w-auto object-contain hover:scale-105 transition-all duration-500"
          alt={data.name}
          onError={(e) => {
            // @ts-ignore
            e.target.src = PLACEHOLDER_IMAGE;
          }}
        />
      </div>
    </div>
  );
};

export default PhotoSection;
