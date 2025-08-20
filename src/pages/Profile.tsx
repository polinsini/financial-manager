import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "../store/hooks";
import {
  selectUser,
  selectCurrencies,
  selectCurrency,
} from "../store/slices/authSlice";
import {
  addNotification,
  removeNotification,
} from "../store/slices/notificationSlice";
import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { updateProfile } from "firebase/auth";
import { db, auth } from "../firebase";

export const ProfilePage: React.FC = () => {
  const currencies = useAppSelector(selectCurrencies);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector(selectUser);
  const selectedCurrency = useAppSelector(selectCurrency);
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [currency, setCurrency] = useState<string>(selectedCurrency);
  //const [createdAt, setCreatedAt] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!user) {
      dispatch(
        addNotification({
          message: "Пользователь не авторизован",
          type: "error",
        }),
      );
      navigate("/auth");
      return;
    }

    const fetchUserData = async () => {
      try {
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const data = userDoc.data();
          setName(data.name || user.displayName || "");
          setEmail(data.email || user.email || "");
          setCurrency(data.currency || selectedCurrency || "USD");
        } else {
          await updateDoc(userDocRef, {
            name: user.displayName || "",
            email: user.email || "",
            currency: selectedCurrency || "RUB",
            createdAt: new Date(),
          });
          setName(user.displayName || "");
          setEmail(user.email || "");
          setCurrency(selectedCurrency || "RUB");
        }
      } catch (error) {
        dispatch(
          addNotification({
            message: "Ошибка загрузки данных профиля",
            type: "error",
          }),
        );
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user, dispatch, navigate, selectedCurrency]);

  const handleSave = async () => {
    if (!user || !name || !currency) {
      dispatch(
        addNotification({
          message: "Заполните все поля корректно",
          type: "error",
        }),
      );
      return;
    }

    const notificationId = Date.now().toString();
    dispatch(
      addNotification({ message: "Сохранение профиля...", type: "info" }),
    );

    try {
      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, {
        name,
        currency,
        email,
        updatedAt: new Date(),
      });

      await updateProfile(auth.currentUser!, { displayName: name });

      dispatch({
        type: "auth/updateUser",
        payload: {
          ...user,
          displayName: name,
          currency,
          email,
        },
      });

      dispatch(
        addNotification({ message: "Профиль обновлен", type: "success" }),
      );
    } catch {
      dispatch(
        addNotification({
          message: "Ошибка обновления профиля",
          type: "error",
        }),
      );
    } finally {
      setTimeout(() => dispatch(removeNotification(notificationId)), 5000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#000300] flex items-center justify-center">
        <p className="text-white">Загрузка...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-[#000300] text-white">
      <h1 className="text-2xl font-bold mb-6">Профиль</h1>
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 max-w-md mx-auto">
        <Input
          label="Имя"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ваше имя"
          required
        />
        <Input
          label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Ваш email"
        />
        <div className="mb-4">
          <label className="block text-white text-sm font-bold mb-2">
            Валюта
            <span className="text-red-500">*</span>
          </label>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-lime-500"
            required
          >
            {currencies.map(({ code, symbol }) => (
              <option key={code} value={code}>
                {code} ({symbol})
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-between mt-4">
          <Button
            bgColor="bg-gray-700"
            hoverBgColor="hover:bg-gray-600"
            textColor="text-white"
            onClick={() => navigate("/dashboard")}
          >
            Назад
          </Button>
          <Button
            bgColor="bg-lime-600"
            hoverBgColor="hover:bg-lime-500"
            textColor="text-black"
            onClick={handleSave}
          >
            Сохранить
          </Button>
        </div>
      </div>
    </div>
  );
};
