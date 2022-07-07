import { useState } from "react";

const defaultKeyboardSetting = {
  q: "q",
  w: "w",
  e: "e",
  r: "r",
  d: "d",
  f: "f",
};

export const useKeyboardSetting = () => {
  const [isDotaKeyboard, setIsDotaKeyboard] = useState(() => {
    const isDota = localStorage.getItem("isDotaKeyboard");
    return isDota !== "false";
  });

  const [keyboardSetting, setKeyboardSetting] = useState(() => {
    const localMap = localStorage.getItem("keyboardSetting");
    if (localMap) {
      try {
        return JSON.parse(localMap);
      } catch (error) {}
      return defaultKeyboardSetting;
    }
    return defaultKeyboardSetting;
  });

  return {
    keyboardSetting,
    isDotaKeyboard,
    setIsDotaKeyboard,
    setKeyboardSetting,
  };
};
