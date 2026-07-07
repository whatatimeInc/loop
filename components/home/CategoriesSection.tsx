"use client";

import Link from "next/link";
import { motion, useInView, cubicBezier } from "framer-motion";
import { useRef } from "react";
import {
  IconCategoriaCarreira,
  IconCategoriaSaude,
  IconCategoriaArte,
  IconCategoriaGastronomia,
  IconCategoriaModa,
  IconCategoriaCasa,
} from "@/components/icons";

const ease = cubicBezier(0.22, 1, 0.36, 1);

const CATEGORIAS = [
  { label: "Carreira e Negócios", icon: <IconCategoriaCarreira className="w-5 h-5" />, href: "/explorar?categoria=Carreira+e+Neg%C3%B3cios" },
  { label: "Saúde e Bem Estar",   icon: <IconCategoriaSaude className="w-5 h-5" />,    href: "/explorar?categoria=Sa%C3%BAde+e+Bem+Estar" },
  { label: "Criatividade",        icon: <IconCategoriaArte className="w-5 h-5" />,     href: "/explorar?categoria=Criatividade" },
  { label: "Gastronomia",         icon: <IconCategoriaGastronomia className="w-5 h-5" />, href: "/explorar?categoria=Gastronomia" },
  { label: "Estilo de Vida",      icon: <IconCategoriaModa className="w-5 h-5" />,     href: "/explorar?categoria=Estilo+de+Vida" },
  { label: "Tecnologia",          icon: <IconCategoriaCasa className="w-5 h-5" />,     href: "/explorar?categoria=Tecnologia" },
];

export function CategoriesSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-15% 0px" });

  return (
    /* Wrapper com bg dark e padding para o container flutuante */
    <section className="py-6 px-4 md:px-6" style={{ background: "#F4F2EB" }}>
      <div
        ref={ref}
        className="relative overflow-hidden rounded-xl min-h-[60vh] flex items-center justify-center max-w-7xl mx-auto"
      >
        {/* Vídeo de fundo */}
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/videos/categories.mov" type="video/quicktime" />
          <source src="/videos/categories.mov" type="video/mp4" />
        </video>

        {/* Overlay */}
        <div className="absolute inset-0 bg-dark/60" />

        {/* Conteúdo */}
        <div className="relative z-10 text-center px-6 py-16 w-full">
          <motion.h2
            className="text-3xl md:text-5xl font-normal text-white mb-10 max-w-2xl mx-auto leading-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.65, ease }}
          >
            Encontre os melhores<br />em todas as áreas
          </motion.h2>

          <div className="flex flex-wrap gap-3 justify-center max-w-2xl mx-auto">
            {CATEGORIAS.map(({ label, icon, href }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 20, scale: 0.94 }}
                animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
                transition={{ duration: 0.45, ease, delay: 0.2 + i * 0.07 }}
              >
                <Link
                  href={href}
                  className="flex items-center gap-2.5 h-12 px-5 rounded-md border border-white/20 text-sm font-medium text-white bg-white/10 backdrop-blur-md hover:bg-white/25 hover:border-white/35 hover:scale-[1.04] transition-all"
                >
                  {icon}
                  {label}
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
