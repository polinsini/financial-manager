import { useEffect, useState } from "react";
import { FormRegister } from "../components/FormRegister";
import { FormLogin } from "../components/FormLogin";
import { Notification } from "../components/Notification";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { register, login, loginWithGoogle } from "../store/slices/authSlice";
import {
  addNotification,
  removeNotification,
} from "../store/slices/notificationSlice";
import { Button } from "../components/Button";

export const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(false);
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.auth);

  useEffect(() => {
    let id: string | null = null;
    if (loading) {
      id = Date.now().toString();
      dispatch(addNotification({ message: "Загрузка...", type: "info" }));
    }
    return () => {
      if (id) {
        dispatch(removeNotification(id));
      }
    };
  }, [loading, dispatch]);

  useEffect(() => {
    if (error) {
      const id = Date.now().toString();
      dispatch(addNotification({ message: error, type: "error" }));
      const timer = setTimeout(() => dispatch(removeNotification(id)), 5000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  const handleRegister = async (
    name: string,
    email: string,
    password: string,
  ) => {
    await dispatch(register({ name, email, password }));
  };

  const handleLogin = async (email: string, password: string) => {
    await dispatch(login({ email, password }));
  };

  const handleLoginGoogle = async () => {
    await dispatch(loginWithGoogle());
  };

  return (
    <div className="bg-[#000300] text-white max-w-md mx-auto mt-10 p-6 rounded-lg shadow-lg">
      <Notification />
      {!isLogin ? (
        <>
          <FormRegister onSubmit={handleRegister} />
          <p>Уже есть аккаунт?</p>
          <Button
            bgColor="bg-lime-600"
            hoverBgColor="hover:bg-lime-700"
            textColor="text-white"
            onClick={() => setIsLogin(true)}
          >
            Войти
          </Button>
          <Button
            bgColor="bg-lime-600"
            hoverBgColor="hover:bg-lime-700"
            textColor="text-white"
            onClick={handleLoginGoogle}
          >
            Войти через Google
          </Button>
        </>
      ) : (
        <>
          <FormLogin onSubmit={handleLogin} />
          <Button
            bgColor="bg-lime-600"
            hoverBgColor="hover:bg-lime-700"
            textColor="text-white"
            onClick={handleLoginGoogle}
          >
            Войти через Google
          </Button>
          <p>Нет аккаунта?</p>
          <Button
            bgColor="bg-black"
            hoverBgColor="hover:bg-gray-800"
            textColor="text-white"
            outlineColor="lime-600"
            onClick={() => setIsLogin(false)}
          >
            Зарегистрироваться
          </Button>
        </>
      )}
    </div>
  );
};
