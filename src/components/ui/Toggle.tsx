interface ToggleProps {
  checked: boolean;
  onChange?: () => void;
}

export function Toggle({ checked, onChange }: ToggleProps) {
  return (
    <button
      onClick={onChange}
      className={`w-10 h-6 rounded-full p-0.5 transition-colors cursor-pointer focus:outline-none ${
        checked ? "bg-blue-500" : "bg-zinc-600"
      }`}
    >
      <div
        className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
          checked ? "translate-x-4" : "translate-x-0"
        }`}
      />
    </button>
  );
}
