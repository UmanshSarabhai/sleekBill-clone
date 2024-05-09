import React from "react";
import { Link } from "react-router-dom";

const HomeButton = () => {
  React.useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.key === "Escape") {
        window.location.href = "/dashboard";
      }
    };

    document.addEventListener("keydown", handleKeyPress);

    return () => {
      document.removeEventListener("keydown", handleKeyPress);
    };
  }, []);
  return (
    <Link to="/">
      <button
        className="cursor-pointer duration-200 hover:scale-110 active:scale-100"
        title="Go Home"
        style={{
          border: "1px solid lightslategray",
          marginLeft: 20,
          padding: 8,
          borderRadius: 5,
        }}
      >
        <svg
          class="w-6 h-6 text-gray-800 dark:text-white"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="m4 12 8-8 8 8M6 10.5V19a1 1 0 0 0 1 1h3v-3a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3h3a1 1 0 0 0 1-1v-8.5"
          />
        </svg>
      </button>
    </Link>
  );
};

export default HomeButton;
