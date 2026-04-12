export const saveGame = (data) => {
  localStorage.setItem("idleRPG", JSON.stringify({
    ...data,
    savedAt: Date.now(),
  }));
};

export const loadGame = () => {
  const saved = localStorage.getItem("idleRPG");
  return saved ? JSON.parse(saved) : null;
};
