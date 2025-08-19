import React from "react";

import { Hero } from "../components/Hero";
import { Features } from "../components/Features";

export const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <main className="flex-1">
        <Hero />
        <Features />
      </main>
    </div>
  );
};
