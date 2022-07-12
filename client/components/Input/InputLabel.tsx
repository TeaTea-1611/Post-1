import classNames from "classnames/bind";
import styles from "./Input.module.scss";
import { useRef, useId, useState } from "react";
import { useField } from "formik";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-regular-svg-icons";

const cx = classNames.bind(styles);

interface IProps {
  onClear?: () => void;
  className?: string;
  type?: string;
  name: string;
  label: string;
  placeholder?: string;
  isPassword?: boolean;
}

const InputLabel = ({
  onClear,
  className,
  label,
  placeholder,
  isPassword,
  ...props
}: IProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const id = useId();
  const [showPassword, setShowPassword] = useState(isPassword);

  const classed = cx("form-group", {
    label,
    [className as string]: className,
  });

  const [field, { error }] = useField(props);

  return (
    <>
      <div className={classed}>
        {label && (
          <label className={cx("label-title")} htmlFor={id}>
            {label}
          </label>
        )}
        <input
          ref={inputRef}
          {...field}
          id={id}
          type={showPassword ? "password" : "text"}
          className={cx("form-control")}
          {...props}
        />
        {isPassword &&
          (showPassword ? (
            <FontAwesomeIcon
              icon={faEye}
              className={cx("icon-eye")}
              onClick={() => setShowPassword(!showPassword)}
            />
          ) : (
            <FontAwesomeIcon
              icon={faEyeSlash}
              className={cx("icon-eye")}
              onClick={() => setShowPassword(!showPassword)}
            />
          ))}
      </div>
      <p className={cx("error-message")}>{error}</p>
    </>
  );
};

export default InputLabel;
