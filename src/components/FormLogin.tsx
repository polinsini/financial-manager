import type React from "react";
import { useState } from "react";
import { Input } from "./Input";
import { Button } from "./Button";

type FormLoginProps = {
  onSubmit: (email: string, password: string) => void;
};

export function FormLogin({ onSubmit }: FormLoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      setError("Логин и пароль обязательны");
      return;
    }
    setError("");
    onSubmit(email, password);
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2 className="text-2xl font-bold text-lime-600 mb-6 text-center">
        Вход в аккаунт
      </h2>
      <Input
        label="Введите почту"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <Input
        label="Введите пароль"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <Button
        bgColor="bg-lime-600"
        hoverBgColor="hover:bg-lime-700"
        textColor="text-white"
      >
        Войти
      </Button>
    </form>
  );
}
