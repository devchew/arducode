import style from "./Button.module.css";

export const Button = (
  props: React.ButtonHTMLAttributes<HTMLButtonElement>
) => {
  return (
    <button {...props} className={style.button}>
      Click message
    </button>
  );
};
