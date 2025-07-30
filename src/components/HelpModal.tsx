import React from 'react';
import { X, Gamepad2, Scan, Palette, ChefHat, Trophy, Heart, Utensils } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const helpSections = [
    {
      icon: <Gamepad2 className="w-6 h-6 text-blue-500" />,
      title: "¿Cómo jugar?",
      content: [
        "ComidaVentura es un juego educativo donde aprendes sobre nutrición",
        "Puedes jugar en dos modos diferentes: Creativo y Tradicional",
        "¡Escanea ingredientes y crea platos saludables!"
      ]
    },
    {
      icon: <Scan className="w-6 h-6 text-green-500" />,
      title: "Escaneo NFC",
      content: [
        "Usa las tarjetas NFC para agregar ingredientes",
        "Acerca la tarjeta al lector NFC de tu dispositivo",
        "Los ingredientes aparecerán automáticamente en tu plato"
      ]
    },
    {
      icon: <Palette className="w-6 h-6 text-purple-500" />,
      title: "Modo Creativo",
      content: [
        "¡Crea tu plato libremente!",
        "Agrega cualquier combinación de ingredientes",
        "Experimenta con diferentes sabores y colores",
        "Obtén sugerencias de recetas con el botón '¡Dame ideas!'"
      ]
    },
    {
      icon: <ChefHat className="w-6 h-6 text-orange-500" />,
      title: "Modo Tradicional",
      content: [
        "Sigue recetas tradicionales ecuatorianas",
        "La IA te dará una receta específica para completar",
        "Escanea solo los ingredientes correctos",
        "¡Aprende sobre la cocina típica de Ecuador!"
      ]
    },
    {
      icon: <Trophy className="w-6 h-6 text-yellow-500" />,
      title: "Sistema de Puntos",
      content: [
        "Gana 15 puntos por cada ingrediente agregado",
        "Completa platos para aumentar tu racha",
        "Obtén medallas por logros especiales",
        "¡Conviértete en un Chef Maestro!"
      ]
    },
    {
      icon: <Heart className="w-6 h-6 text-red-500" />,
      title: "Beneficios Educativos",
      content: [
        "Aprende sobre grupos alimenticios",
        "Descubre valores nutricionales",
        "Conoce recetas tradicionales",
        "Desarrolla hábitos alimenticios saludables"
      ]
    }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Utensils className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Guía de ComidaVentura</h2>
                <p className="text-blue-100">Todo lo que necesitas saber para jugar</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center hover:bg-white/30 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="grid md:grid-cols-2 gap-6">
            {helpSections.map((section, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                    {section.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">{section.title}</h3>
                </div>
                <div className="space-y-2">
                  {section.content.map((item, itemIndex) => (
                    <p key={itemIndex} className="text-gray-600 text-sm leading-relaxed">
                      • {item}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Quick Tips */}
          <div className="mt-8 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-6 border border-yellow-200">
            <h3 className="text-lg font-semibold text-orange-800 mb-4 flex items-center">
              <Trophy className="w-5 h-5 mr-2" />
              Consejos Rápidos
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-sm text-orange-700">
                  <strong>🎯 Para mejores resultados:</strong> Combina ingredientes de diferentes grupos alimenticios
                </p>
                <p className="text-sm text-orange-700">
                  <strong>⚡ Truco:</strong> En modo creativo, puedes pedir sugerencias de recetas
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-orange-700">
                  <strong>🏆 Logros:</strong> Completa platos para desbloquear nuevas medallas
                </p>
                <p className="text-sm text-orange-700">
                  <strong>📱 NFC:</strong> Asegúrate de que las tarjetas estén cerca del sensor
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-gray-500 text-sm">
              ¿Tienes más preguntas? ¡Experimenta y diviértete aprendiendo! 🎮
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};