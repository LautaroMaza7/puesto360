import { cn } from "@/lib/utils";
import { satoshi, integralCF } from "@/styles/fonts";
import React from "react";
import * as motion from "framer-motion/client";
import DressStyleCard from "./DressStyleCard";

const DressStyle = () => {
  return (
    <div className="px-4 xl:px-0">
      <section className="max-w-frame mx-auto bg-[#F0F0F0] px-6 pb-6 pt-10 md:p-[70px] rounded-[40px] text-center">
        <motion.h2
          initial={{ y: "100px", opacity: 0 }}
          whileInView={{ y: "0", opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className={cn([
            integralCF.className,
            "text-3xl md:text-4xl font-bold text-center mb-8 md:mb-12",
          ])}
        >
          EXPLORA POR CATEGORÍA DE BEBIDAS
        </motion.h2>
        <motion.div
          initial={{ y: "100px", opacity: 0 }}
          whileInView={{ y: "0", opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="flex flex-col sm:flex-row md:h-[289px] space-y-4 sm:space-y-0 sm:space-x-5 mb-4 sm:mb-5"
        >
          <DressStyleCard
            title="Whisky"
            url="/shop?subcategory=whisky"
            className="md:max-w-[260px] lg:max-w-[360px] xl:max-w-[407px] h-[190px] bg-[url('/images/whisky.jpg')]"
          />
          <DressStyleCard
            title="Licores"
            url="/shop?subcategory=licores"
            className="text-white md:max-w-[684px] h-[190px] bg-[url('/images/licores.jpg')]"
          />
        </motion.div>
        <motion.div
          initial={{ y: "100px", opacity: 0 }}
          whileInView={{ y: "0", opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 1, duration: 0.6 }}
          className="flex flex-col sm:flex-row md:h-[289px] space-y-5 sm:space-y-0 sm:space-x-5"
        >
          <DressStyleCard
            title="Gin"
            url="/shop?subcategory=gin"
            className="md:max-w-[684px] h-[190px] bg-[url('/images/gin.jpg')]"
          />
          <DressStyleCard
            title="Vodka"
            url="/shop?subcategory=vodka"
            className="md:max-w-[260px] lg:max-w-[360px] xl:max-w-[407px] h-[190px] bg-[url('/images/vodka.jpg')]"
          />
        </motion.div>
      </section>
    </div>
  );
};

export default DressStyle;
