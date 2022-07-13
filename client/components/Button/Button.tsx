import classNames from "classnames/bind";
import Link from "next/link";
import styles from "./Button.module.scss";
const cx = classNames.bind(styles);

interface IProps {
  to?: string;
  onClick?: () => void;
  className?: string;
  children?: React.ReactNode;
  disabled?: boolean;
  type: "button" | "submit" | "reset";
  primary?: boolean;
  outline?: boolean;
  small?: boolean;
  medium?: boolean;
  large?: boolean;
  text?: boolean;
  href?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

function Button({
  type,
  className,
  to,
  primary,
  outline,
  small,
  medium,
  large,
  text,
  href,
  children,
  onClick,
  leftIcon,
  rightIcon,
  ...passProps
}: IProps) {
  // const { theme } = useSelector((state) => state.app);
  let Comp: any = "button";
  let props: any = {
    ...passProps,
  };
  if (to) {
    props.to = to;
    Comp = Link;
  } else if (href) {
    props.href = href;
    Comp = "a";
  }

  const classed = cx("button", {
    primary,
    outline,
    small,
    medium,
    large,
    text,
    [className as string]: className,
  });

  return (
    <Comp type={type} className={classed} onClick={onClick} {...props}>
      {leftIcon && <span className={cx("btn-icon")}>{leftIcon}</span>}
      <span className={cx("btn-content")}>{children}</span>
      {rightIcon && <span className={cx("btn-icon")}>{rightIcon}</span>}
    </Comp>
  );
}

export default Button;
