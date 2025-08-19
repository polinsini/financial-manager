import React from "react";

export const Hero: React.FC = () => {
  return (
    <section className="flex flex-col items-center text-center px-6 py-12">
      <h2 className="text-4xl font-extrabold text-gray-900 mb-4">
        Управляй своими финансами легко 🚀
      </h2>
      <p className="text-lg text-gray-600 max-w-2xl mb-8">
        Финансовый менеджер поможет тебе контролировать расходы, планировать
        бюджет и достигать финансовых целей.
      </p>

      <img
        src="https://images.unsplash.com/photo-1556742044-3c52d6e88c62?auto=format&fit=crop&w=1200&q=80"
        alt="Финансы"
        className="sm:max-w-xl rounded-2xl shadow-lg mb-12  "
      />
    </section>
  );
};
