import { Form, Formik } from "formik";
import { Button } from "../components/Button";
import { InputLabel } from "../components/Input";
import classNames from "classnames/bind";
import styles from "../styles/form.module.scss";
import {
  ForgotPasswordInput,
  useForgotPasswordMutation,
} from "../generated/graphql";
import { useCheckAuth } from "../utils/useCheckAuth";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faYinYang } from "@fortawesome/free-solid-svg-icons";

const cx = classNames.bind(styles);

const ForgotPassword = () => {
  const [forgotPassword] = useForgotPasswordMutation();

  const { data: authData, loading: authLoading } = useCheckAuth();

  const handleSubmit = async (values: ForgotPasswordInput) => {
    await forgotPassword({
      variables: {
        forgotPasswordInput: values,
      },
    });
  };
  return (
    <Formik initialValues={{ email: "" }} onSubmit={handleSubmit}>
      {() => (
        <div className={cx("forgot-password")}>
          <Form
            className={cx("form", {
              loading: authLoading || (!authLoading && authData?.me),
            })}
          >
            {authLoading || (!authLoading && authData?.me) ? (
              <FontAwesomeIcon
                icon={faYinYang}
                spin
                style={{ fontSize: "100px" }}
              />
            ) : (
              <>
                <h1>Forgot Password</h1>
                <InputLabel name="email" label="Email" />
                <Button type="submit" className={cx("submit")}>
                  Confirm
                </Button>
              </>
            )}
          </Form>
        </div>
      )}
    </Formik>
  );
};

export default ForgotPassword;
