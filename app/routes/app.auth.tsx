import React from "react";

export default function AuthPage() {
  return (
    <div className="h-96 bg-primary rounded-lg px-8 py-10">
      <div className="flex  items-center gap-2">
        <p>Please login here to select your widget!</p>
        <button className="bg-rose-600 text-white py-2 px-8 rounded">
          Login
        </button>
      </div>
    </div>
  );
}
