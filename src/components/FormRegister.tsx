import type React from "react";
import { useState } from "react";
import { Input } from "./Input";
import { Button } from "./Button";

type FormRegisterProps = {
  onSubmit: (name: string, email: string, password: string) => void;
};

export function FormRegister({ onSubmit }: FormRegisterProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordRepeat, setPasswordRepeat] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      setError("Логин и пароль обязательны");
      return;
    }
    if (password !== passwordRepeat) {
      setError("Пароли не совпадают");
      return;
    }
    setError("");
    onSubmit(name, email, password);
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2 className="text-2xl font-bold text-lime-600 mb-6 text-center">
        Регистрация
      </h2>
      <Input
        label="Введите имя"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="имя"
      />
      <Input
        label="Введите email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="email"
      />
      <Input
        label="Придумайте пароль"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <Input
        label="Повторите пароль"
        type="password"
        value={passwordRepeat}
        onChange={(e) => setPasswordRepeat(e.target.value)}
      />
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <Button
        bgColor="bg-black"
        hoverBgColor="hover:bg-gray-800"
        textColor="text-white"
        outlineColor="lime-600"
      >
        Зарегистрироваться
      </Button>
    </form>
  );
}
