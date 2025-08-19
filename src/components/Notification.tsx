import React from "react";
import { useAppSelector } from "../store/hooks";

export const Notification: React.FC = () => {
  const notifications = useAppSelector((state) => state.notifications.list);

  const getMessage = (message: string | Error): string => {
    return typeof message === "string"
      ? message
      : message.message || "Произошла ошибка";
  };

  return (
    <>
      {notifications.map(({ id, message, type }) => {
        let bgClass = "";
        let textClass = "";
        let icon = null;

        switch (type) {
          case "success":
            bgClass =
              "bg-green-100 text-green-500 dark:bg-green-800 dark:text-green-200";
            textClass = "text-gray-500 dark:text-gray-400";
            icon = (
              <svg
                className="h-5 w-5"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z" />
              </svg>
            );
            break;
          case "error":
            bgClass =
              "bg-red-100 text-red-500 dark:bg-red-800 dark:text-red-200";
            textClass = "text-gray-500 dark:text-gray-400";
            icon = (
              <svg
                className="h-5 w-5"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 11.793a1 1 0 1 1-1.414 1.414L10 11.414l-2.293 2.293a1 1 0 0 1-1.414-1.414L8.586 10 6.293 7.707a1 1 0 0 1 1.414-1.414L10 8.586l2.293-2.293a1 1 0 0 1 1.414 1.414L11.414 10l2.293 2.293Z" />
              </svg>
            );
            break;
          case "info":
            bgClass =
              "bg-blue-100 text-blue-500 dark:bg-blue-800 dark:text-blue-200";
            textClass = "text-gray-500 dark:text-gray-400";
            icon = (
              <svg
                className="animate-spin h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            );
            break;
        }

        return (
          <div
            key={id}
            className={`fixed right-5 top-5 mb-4 flex w-full max-w-xs items-center rounded-lg bg-white p-4 shadow dark:bg-gray-800 ${textClass}`}
            role="alert"
          >
            <div
              className={`inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ${bgClass}`}
            >
              {icon}
              <span className="sr-only">{type} icon</span>
            </div>
            <div className="ms-3 text-sm font-normal">
              {getMessage(message)}
            </div>
          </div>
        );
      })}
    </>
  );
};
