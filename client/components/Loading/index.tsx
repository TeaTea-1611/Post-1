import classNames from "classnames/bind";
import styles from "./loading.module.scss";

const cx = classNames.bind(styles);

interface LoadingProps {
  small?: boolean;
  medium?: boolean;
  large?: boolean;
  className?: string;
}

function Loading({ small, medium, large, className }: LoadingProps) {
  const classed = cx("loading", {
    small,
    medium,
    large,
    [className as string]: className,
  });

  const size = large ? 40 : medium ? 20 : 8;

  return (
    <svg className={classed}>
      <circle cx={size} cy={size} r={size} />
    </svg>
  );
}

export default Loading;
