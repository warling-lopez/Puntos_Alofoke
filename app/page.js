"use client";
import React, { useState, useEffect } from "react";
import { Trophy, Star, Flame, ChevronDown } from "lucide-react"; // 'Award' eliminado

export default function Home() {
  const [scrolled, setScrolled] = useState(false);
  const [hoveredId, setHoveredId] = useState(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Datos de los participantes
  const participantes = [
    {
      id: 1,
      nombre: "Carlos Montesquieu",
      puntos: 2450,
      imagen:
        "https://listindiario.com/files/vertical_main_image/files/fp/uploads/2025/06/09/68474981f2f15.r_d.460-222.jpeg",
      equipo: "Rojo",
      racha: 12,
      nivel: "Leyenda",
    },
    {
      id: 2,
      nombre: "Young Swagon",
      puntos: 2380,
      imagen:
        "https://listindiario.com/files/vertical_main_image/uploads/2025/10/21/68f7893ec19be.jpeg",
      equipo: "Azul",
      racha: 8,
      nivel: "Maestro",
    },
    {
      id: 3,
      nombre: "Juan Carlos Pichardo",
      puntos: 2290,
      imagen:
        "https://listindiario.com/files/vertical_main_image/uploads/2018/03/19/642ea41b997ad.jpeg",
      equipo: "Verde",
      racha: 15,
      nivel: "Leyenda",
    },
    {
      id: 4,
      nombre: "Shadow Blow",
      puntos: 2150,
      imagen:
        "https://listindiario.com/files/vertical_main_image/files/fp/uploads/2023/06/06/647ff92b5e5b3.r_d.736-458.jpeg",
      equipo: "Rojo",
      racha: 5,
      nivel: "Experto",
    },
    {
      id: 5,
      nombre: "La Perversa",
      puntos: 2090,
      imagen:
        "https://listindiario.com/files/vertical_main_image/files/fp/uploads/2025/03/14/67d46fdc5e523.r_d.73-268.jpeg",
      equipo: "Azul",
      racha: 10,
      nivel: "Experto",
    },
    {
      id: 6,
      nombre: "Randy Álvarez",
      puntos: 1980,
      imagen:
        "https://listindiario.com/files/vertical_main_image/uploads/2025/10/21/68f789a715562.jpeg",
      equipo: "Verde",
      racha: 7,
      nivel: "Experto",
    },
    {
      id: 7,
      nombre: "Gracie Bon",
      puntos: 1980,
      imagen:
        "https://listindiario.com/files/vertical_main_image/uploads/2025/10/21/68f789d57da94.jpeg",
      equipo: "Verde",
      racha: 7,
      nivel: "Experto",
    },
    {
      id: 8,
      nombre: "Luis Santana",
      puntos: 1980,
      imagen:
        "https://listindiario.com/files/vertical_main_image/uploads/2025/10/21/68f78a0f372d9.jpeg",
      equipo: "Verde",
      racha: 7,
      nivel: "Experto",
    },
    {
      id: 9,
      nombre: "Mami Nola",
      puntos: 1980,
      imagen:
        "https://listindiario.com/files/vertical_main_image/uploads/2025/10/21/68f78affb7850.jpeg",
      equipo: "Verde",
      racha: 7,
      nivel: "Experto",
    },
    {
      id: 10,
      nombre: "Diosa Canales",
      puntos: 1980,
      imagen:
        "https://listindiario.com/files/vertical_main_image/uploads/2025/10/21/68f78b527edb5.jpeg",
      equipo: "Verde",
      racha: 7,
      nivel: "Experto",
    },
    {
      id: 11,
      nombre: "Valka",
      puntos: 1980,
      imagen:
        "https://listindiario.com/files/vertical_main_image/uploads/2025/10/21/68f78b96018f2.jpeg",
      equipo: "Verde",
      racha: 7,
      nivel: "Experto",
    },
    {
      id: 12,
      nombre: "Melina Rodríguez",
      puntos: 1980,
      imagen:
        "https://listindiario.com/files/vertical_main_image/uploads/2025/10/21/68f78bca3190e.jpeg",
      equipo: "Verde",
      racha: 7,
      nivel: "Experto",
    },
    {
      id: 13,
      nombre: "Luis Polonia",
      puntos: 1980,
      imagen:
        "https://listindiario.com/files/vertical_main_image/uploads/2025/10/21/68f78bca3190e.jpeg",
      equipo: "Verde",
      racha: 7,
      nivel: "Experto",
    },
    {
      id: 14,
      nombre: "Dianabel Gómez",
      puntos: 1980,
      imagen:
        "https://listindiario.com/files/vertical_main_image/uploads/2025/10/21/68f78c6882cbf.jpeg",
      equipo: "Verde",
      racha: 7,
      nivel: "Experto",
    },
    {
      id: 15,
      nombre: "La Fruta",
      puntos: 1980,
      imagen:
        "https://listindiario.com/files/vertical_main_image/uploads/2025/10/21/68f78c6882cbf.jpeg",
      equipo: "Verde",
      racha: 7,
      nivel: "Experto",
    },
    {
      id: 16,
      nombre: "Jlexis y Michael Flores",
      puntos: 1980,
      imagen:
        "https://listindiario.com/files/vertical_main_image/uploads/2025/10/21/68f78f1f93d44.jpeg",
      equipo: "Verde",
      racha: 7,
      nivel: "Experto",
    },
    {
      id: 17,
      nombre: "Julissa Gutiérrez (Magaly)",
      puntos: 1980,
      imagen:
        "https://listindiario.com/files/vertical_main_image/uploads/2025/10/21/68f78f5486a5d.jpeg",
      equipo: "Verde",
      racha: 7,
      nivel: "Experto",
    },
    {
      id: 18,
      nombre: "Daniela Barranco",
      puntos: 1980,
      imagen:
        "https://listindiario.com/files/vertical_main_image/uploads/2025/10/21/68f7902d17778.jpeg",
      equipo: "Verde",
      racha: 7,
      nivel: "Experto",
    },
    {
      id: 19,
      nombre: "JD con su Flow",
      puntos: 1980,
      imagen:
        "https://listindiario.com/files/vertical_main_image/uploads/2025/10/21/68f78ff2dc00e.jpeg",
      equipo: "Verde",
      racha: 7,
      nivel: "Experto",
    },
  ];

  // --- MODIFICADO ---
  // Colores del podio unificados al tema rojo/negro
  const getPodiumColor = (position) => {
    if (position === 0) return "from-red-500 via-red-600 to-red-800"; // Base más brillante
    if (position === 1) return "from-red-700 via-red-800 to-red-900"; // Base intermedia
    if (position === 2) return "from-red-900 via-red-950 to-black"; // Base más oscura
    return "from-red-950 via-black to-black";
  };

  const getPodiumHeight = (position) => {
    if (position === 0) return "h-72";
    if (position === 1) return "h-60";
    if (position === 2) return "h-52";
    return "h-48";
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* Header con efecto glassmorphism */}
      <header
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          scrolled
            ? "bg-black/80 backdrop-blur-lg border-b border-red-900/50"
            : "bg-transparent"
        }`}
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Trophy className="w-8 h-8 text-red-600 animate-pulse" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-red-900 bg-clip-text text-transparent">
                PODIO 2025
              </h1>
            </div>
            <nav className="hidden md:flex gap-6">
              <a
                href="#ranking"
                className="hover:text-red-600 transition-colors"
              >
                Ranking
              </a>
              <a
                href="#participantes"
                className="hover:text-red-600 transition-colors"
              >
                Participantes
              </a>
              <a
                href="#premios"
                className="hover:text-red-600 transition-colors"
              >
                Premios
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section con animaciones */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Fondo animado */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-red-950/50 via-black to-red-900/30" />
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-900 rounded-full filter blur-3xl opacity-20 animate-pulse" />
          <div
            className="absolute bottom-0 right-1/4 w-96 h-96 bg-red-950 rounded-full filter blur-3xl opacity-20 animate-pulse"
            style={{ animationDelay: "1s" }}
          />
        </div>

        <div className="relative z-10 text-center px-4 mt-20">
          <div className="mb-8 animate-bounce">
            <Star className="w-20 h-20 text-red-600 mx-auto" />
          </div>
          <h2 className="text-6xl md:text-8xl font-black mb-6 bg-gradient-to-r from-red-600 via-red-800 to-black bg-clip-text text-transparent animate-pulse">
            EL PODIO
          </h2>
          <p className="text-xl md:text-2xl mb-8 text-gray-300">
            Los mejores competidores de la temporada
          </p>
          <div className="flex gap-4 justify-center items-center">
            <Flame className="w-6 h-6 text-red-600" />
            <span className="text-2xl font-bold text-red-500">EN VIVO</span>
            <Flame className="w-6 h-6 text-red-600" />
          </div>
          <ChevronDown className="w-12 h-12 mx-auto mt-12 animate-bounce text-red-600" />
        </div>
      </section>

      {/* --- SECCIÓN DEL PODIO MODIFICADA --- */}
      <section id="ranking" className="py-20 px-4 relative">
        <div className="container mx-auto max-w-6xl">
          <h3 className="text-5xl font-black text-center mb-16 bg-gradient-to-r from-red-600 to-white bg-clip-text text-transparent">
            TOP 3 DEL PODIO
          </h3>

          <div className="flex items-end justify-center gap-4 mb-20">
            {/* Segundo Lugar (MODIFICADO) */}
            <div className="flex-1 max-w-xs">
              <div className="relative group cursor-pointer">
                {/* Brillo rojo */}
                <div className="absolute inset-0 bg-gradient-to-t from-red-700 to-transparent opacity-30 group-hover:opacity-50 transition-opacity rounded-t-3xl" />
                <div className="relative bg-gradient-to-br from-neutral-900 to-black rounded-t-3xl p-6 border-4 border-red-700 transform group-hover:scale-105 transition-transform">
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-red-700 rounded-full w-12 h-12 flex items-center justify-center text-2xl font-bold border-4 border-black">
                    2
                  </div>
                  <img
                    src={participantes[1].imagen}
                    alt={participantes[1].nombre}
                    className="w-32 h-32 rounded-full mx-auto mb-4 border-4 border-red-700 object-cover"
                  />
                  <h4 className="text-xl font-bold text-center mb-2">
                    {participantes[1].nombre}
                  </h4>
                  <div className="text-center">
                    <span className="text-3xl font-black text-red-500">
                      {participantes[1].puntos}
                    </span>
                    <p className="text-sm text-red-700">puntos</p>
                  </div>
                  <div className="mt-4 flex justify-center gap-2">
                    {/* Se fuerza el color rojo/negro para mantener el tema del podio */}
                    <div className="bg-red-500/20 px-3 py-1 rounded-full text-xs text-red-300">
                      {participantes[1].equipo}
                    </div>
                    <div className="bg-red-500/20 px-3 py-1 rounded-full text-xs flex items-center gap-1 text-red-300">
                      <Flame className="w-3 h-3" /> {participantes[1].racha}
                    </div>
                  </div>
                </div>
                <div
                  className={`${getPodiumHeight(
                    1
                  )} bg-gradient-to-t ${getPodiumColor(1)} rounded-b-3xl`}
                />
              </div>
            </div>

            {/* Primer Lugar (MODIFICADO) */}
            <div className="flex-1 max-w-xs">
              <div className="relative group cursor-pointer">
                {/* Brillo rojo intenso */}
                <div className="absolute inset-0 bg-gradient-to-t from-red-500 to-transparent opacity-50 group-hover:opacity-70 transition-opacity rounded-t-3xl" />
                <div className="relative bg-gradient-to-br from-red-950 to-black rounded-t-3xl p-6 border-4 border-red-500 transform group-hover:scale-105 transition-transform">
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
                    <Trophy className="w-16 h-16 text-red-500 animate-pulse" />
                  </div>
                  <img
                    src={participantes[0].imagen}
                    alt={participantes[0].nombre}
                    className="w-40 h-40 rounded-full mx-auto mb-4 border-4 border-red-500 object-cover mt-4"
                  />
                  <h4 className="text-2xl font-bold text-center mb-2">
                    {participantes[0].nombre}
                  </h4>
                  <div className="text-center">
                    <span className="text-4xl font-black text-red-400">
                      {participantes[0].puntos}
                    </span>
                    <p className="text-sm text-red-600">puntos</p>
                  </div>
                  <div className="mt-4 flex justify-center gap-2">
                    <div className="bg-red-500/20 px-3 py-1 rounded-full text-xs text-red-300">
                      {participantes[0].equipo}
                    </div>
                    <div className="bg-red-500/20 px-3 py-1 rounded-full text-xs flex items-center gap-1 text-red-300">
                      <Flame className="w-3 h-3" /> {participantes[0].racha}
                    </div>
                  </div>
                </div>
                <div
                  className={`${getPodiumHeight(
                    0
                  )} bg-gradient-to-t ${getPodiumColor(
                    0
                  )} rounded-b-3xl shadow-2xl shadow-red-500/50`}
                />
              </div>
            </div>

            {/* Tercer Lugar (MODIFICADO) */}
            <div className="flex-1 max-w-xs">
              <div className="relative group cursor-pointer">
                {/* Brillo rojo oscuro */}
                <div className="absolute inset-0 bg-gradient-to-t from-red-800 to-transparent opacity-30 group-hover:opacity-50 transition-opacity rounded-t-3xl" />
                <div className="relative bg-gradient-to-br from-neutral-900 to-black rounded-t-3xl p-6 border-4 border-red-800 transform group-hover:scale-105 transition-transform">
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-red-800 rounded-full w-12 h-12 flex items-center justify-center text-2xl font-bold border-4 border-black">
                    3
                  </div>
                  <img
                    src={participantes[2].imagen}
                    alt={participantes[2].nombre}
                    className="w-32 h-32 rounded-full mx-auto mb-4 border-4 border-red-800 object-cover"
                  />
                  <h4 className="text-xl font-bold text-center mb-2">
                    {participantes[2].nombre}
                  </h4>
                  <div className="text-center">
                    <span className="text-3xl font-black text-red-600">
                      {participantes[2].puntos}
                    </span>
                    <p className="text-sm text-red-800">puntos</p>
                  </div>
                  <div className="mt-4 flex justify-center gap-2">
                    {/* Se fuerza el color rojo/negro para mantener el tema del podio */}
                    <div className="bg-red-500/20 px-3 py-1 rounded-full text-xs text-red-300">
                      {participantes[2].equipo}
                    </div>
                    <div className="bg-red-500/20 px-3 py-1 rounded-full text-xs flex items-center gap-1 text-red-300">
                      <Flame className="w-3 h-3" /> {participantes[2].racha}
                    </div>
                  </div>
                </div>
                <div
                  className={`${getPodiumHeight(
                    2
                  )} bg-gradient-to-t ${getPodiumColor(2)} rounded-b-3xl`}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ranking Completo - Este ya estaba perfecto con el tema rojo/negro */}
      <section
        id="participantes"
        className="py-20 px-4 relative overflow-hidden"
      >
        {/* Fondo oscuro con textura */}
        <div className="absolute inset-0 bg-gradient-to-b from-black via-red-950/10 to-black" />
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
            backgroundSize: "40px 40px",
          }}
        />

        <div className="container mx-auto max-w-7xl relative z-10">
          <h3 className="text-5xl md:text-7xl font-black text-center mb-20 bg-gradient-to-r from-red-600 via-white to-red-600 bg-clip-text text-transparent">
            TODOS LOS COMPETIDORES
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
            {participantes.map((participante, index) => (
              <div
                key={participante.id}
                className="relative group cursor-pointer"
                onMouseEnter={() => setHoveredId(participante.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                {/* Contenedor de imagen con efecto */}
                <div className="relative aspect-square overflow-hidden rounded-2xl">
                  {/* Borde rojo que brilla al hacer hover */}
                  <div
                    className={`absolute inset-0 rounded-2xl transition-all duration-500 ${
                      hoveredId === participante.id
                        ? "ring-4 ring-red-600 shadow-2xl shadow-red-600/50 scale-105"
                        : "ring-2 ring-red-900/30"
                    }`}
                  />

                  {/* Imagen de fondo con filtro oscuro */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent z-10" />

                  {/* Imagen principal */}
                  <img
                    src={participante.imagen}
                    alt={participante.nombre}
                    className={`w-full h-full object-cover transition-all duration-500 ${
                      hoveredId === participante.id
                        ? "scale-110 brightness-110"
                        : "scale-100 brightness-75"
                    }`}
                  />

                  {/* Overlay con gradiente rojo en hover */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-t from-red-900/80 via-red-950/40 to-transparent transition-opacity duration-500 ${
                      hoveredId === participante.id
                        ? "opacity-100"
                        : "opacity-0"
                    }`}
                  />

                  {/* Número de posición */}
                  <div className="absolute top-4 left-4 z-20">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-2xl transition-all duration-300 ${
                        index < 3
                          ? "bg-red-600 text-white shadow-lg shadow-red-600/50"
                          : "bg-black/80 text-red-600 border-2 border-red-900"
                      } ${
                        hoveredId === participante.id
                          ? "scale-110"
                          : "scale-100"
                      }`}
                    >
                      {index + 1}
                    </div>
                  </div>

                  {/* Información del participante */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
                    <h4
                      className={`font-black text-white mb-2 transition-all duration-300 ${
                        hoveredId === participante.id ? "text-2xl" : "text-xl"
                      }`}
                    >
                      {participante.nombre}
                    </h4>

                    {/* Stats que aparecen en hover */}
                    <div
                      className={`transition-all duration-500 overflow-hidden ${
                        hoveredId === participante.id
                          ? "max-h-32 opacity-100"
                          : "max-h-0 opacity-0"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <div className="text-4xl font-black text-red-500">
                          {participante.puntos}
                        </div>
                        <div className="text-sm text-gray-300">puntos</div>
                      </div>

                      <div className="flex gap-2 flex-wrap">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${
                            participante.equipo === "Rojo"
                              ? "bg-red-600 text-white"
                              : participante.equipo === "Azul"
                              ? "bg-blue-600 text-white"
                              : "bg-green-600 text-white"
                          }`}
                        >
                          {participante.equipo}
                        </span>

                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/20 text-white backdrop-blur-sm flex items-center gap-1">
                          <Flame className="w-3 h-3" />
                          {participante.racha}
                        </span>

                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-600/30 text-red-300 backdrop-blur-sm">
                          {participante.nivel}
                        </span>
                      </div>
                    </div>

                    {/* Texto que desaparece en hover */}
                    <div
                      className={`transition-all duration-500 ${
                        hoveredId === participante.id
                          ? "opacity-0 max-h-0"
                          : "opacity-100 max-h-20"
                      }`}
                    >
                      <div className="text-2xl font-black text-red-500">
                        {participante.puntos}
                      </div>
                      <div className="text-sm text-gray-400">puntos</div>
                    </div>
                  </div>

                  {/* Brillo intenso en el borde al hacer hover */}
                  <div
                    className={`absolute -inset-1 bg-gradient-to-r from-red-600 via-red-500 to-red-600 rounded-2xl blur-lg transition-opacity duration-500 -z-10 ${
                      hoveredId === participante.id ? "opacity-75" : "opacity-0"
                    }`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-red-900/50">
        <div className="container mx-auto text-center">
          <Trophy className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <p className="text-gray-400">
            © 2025 Podio Championship. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
