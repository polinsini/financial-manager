import { useState } from "react";
import { AiOutlineClose, AiOutlineMenu } from "react-icons/ai";
import { Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { logout } from "../store/slices/authSlice";
import { selectUser } from "../store/slices/authSlice";
import { Button } from "./Button";

export const NavBar: React.FC = () => {
  const [nav, setNav] = useState<boolean>(false);
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);

  const handleLogout = () => {
    dispatch(logout());
  };
  const handleNav = () => {
    setNav(!nav);
  };

  return (
    <header className="text-white flex justify-between h-24 mx-auto px-4 max-h-[1240px] items-center bg-black">
      <h1 className="w-full text-3xl font-bold text-lime-600">
        Плачь и батрачь 💸
      </h1>
      {!user ? (
        <Link to="/auth">
          <Button
            bgColor="bg-lime-600"
            hoverBgColor="hover:bg-lime-700"
            textColor="text-white"
            className="text-nowrap rounded-2xl"
          >
            Зарегистрироваться | Войти
          </Button>
        </Link>
      ) : (
        <>
          <ul className="hidden md:flex">
            <li className="p-4">
              <Link to="/dashboard">Панель управления</Link>
            </li>
            <li className="p-4">
              <Link to="/analytics">Аналитика</Link>
            </li>
            <li className="p-4">
              <Link to="/profile">Профиль</Link>
            </li>
          </ul>
          <Button
            onClick={handleLogout}
            bgColor="bg-white"
            hoverBgColor="hover:bg-gray-300"
            textColor="text-black"
            outlineColor="lime-600"
            className="rounded-2xl mx-12 outline-offset-[-4px]"
          >
            Выйти
          </Button>
        </>
      )}
      <div onClick={handleNav} className="block md:hidden cursor-pointer">
        {nav ? <AiOutlineClose size={20} /> : <AiOutlineMenu size={20} />}
      </div>
      <div
        className={
          nav
            ? "fixed left-0 top-0 h-full w-[60%] bg-[#000300] border-r border-r-gray-900 ease-in-out duration-500"
            : "fixed left-[-100%]"
        }
      >
        <h1 className="w-full text-3xl m-4 font-bold text-lime-600">
          Плачь и батрачь
        </h1>
        <ul className="uppercase p-4">
          {user ? (
            <>
              <li className="p-4 border-b border-b-lime-700">
                <Link to="/dashboard" onClick={handleNav}>
                  Панель управления
                </Link>
              </li>
              <li className="p-4 border-b border-b-lime-700">
                <Link to="/analytics" onClick={handleNav}>
                  Аналитика
                </Link>
              </li>
              <li className="p-4">
                <Link to="/profile" onClick={handleNav}>
                  Профиль
                </Link>
              </li>
            </>
          ) : (
            <>
              <li className="p-4 border-b border-b-lime-700">
                <Link to="/auth" onClick={handleNav}>
                  Зарегистрироваться
                </Link>
              </li>
              <li className="p-4">
                <Link to="/auth" onClick={handleNav}>
                  Войти
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </header>
  );
};
