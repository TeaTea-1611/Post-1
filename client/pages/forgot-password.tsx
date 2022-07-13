import { Form, Formik } from "formik";
import { Button } from "../components/Button";
import { InputLabel } from "../components/Input";
import classNames from "classnames/bind";
import styles from "../styles/form.module.scss";
import {
  ForgotPasswordInput,
  useForgotPasswordMutation,
} from "../generated/graphql";

const cx = classNames.bind(styles);

const ResetPassword = () => {
  const [forgotPassword] = useForgotPasswordMutation();

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
          <Form className={cx("form")}>
            <h1>Forgot Password</h1>
            <InputLabel name="email" label="Email" />
            <Button type="submit" className={cx("submit")}>
              Confirm
            </Button>
          </Form>
        </div>
      )}
    </Formik>
  );
};

export default ResetPassword;
