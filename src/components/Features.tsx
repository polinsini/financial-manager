import React from "react";

const features = [
  {
    title: "📊 Учет расходов",
    desc: "Веди детальный учет всех трат и доходов в одном месте.",
  },
  {
    title: "📈 Аналитика",
    desc: "Получай наглядные графики и статистику по категориям расходов.",
  },
  {
    title: "💡 Финансовые цели",
    desc: "Планируй и отслеживай прогресс по своим финансовым целям.",
  },
  {
    title: "🔒 Безопасность",
    desc: "Все данные защищены и доступны только тебе через авторизацию.",
  },
];

export const Features: React.FC = () => {
  return (
    <section className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto px-6 pb-12">
      {features.map((f, i) => (
        <div
          key={i}
          className="bg-white p-6 rounded-2xl shadow hover:shadow-lg transition"
        >
          <h3 className="text-xl font-semibold text-lime-600 mb-2">
            {f.title}
          </h3>
          <p className="text-gray-600">{f.desc}</p>
        </div>
      ))}
    </section>
  );
};
