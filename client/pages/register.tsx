import { Form, Formik, FormikHelpers } from "formik";
import { InputLabel } from "../components/Input";
import classNames from "classnames/bind";
import styles from "../styles/register.module.scss";
import { Button } from "../components/Button";
import { RegisterInput, useRegisterMutation } from "../generated/graphql";
import { mapFieldError } from "../helpers/mapFieldError";
import { useRouter } from "next/router";
import { toast } from "react-toastify";

const cx = classNames.bind(styles);

const Register = () => {
  const router = useRouter();
  const [registerUser, { data, error }] = useRegisterMutation();

  const handleSubmit = async (
    values: RegisterInput,
    { setErrors }: FormikHelpers<RegisterInput>
  ) => {
    const res = await registerUser({
      variables: {
        registerInput: values,
      },
    });
    if (res.data?.register?.errors) {
      setErrors(mapFieldError(res.data.register.errors));
    } else if (res.data?.register?.user) {
      toast(res.data.register.message);
      router.push("/");
    }
  };

  return (
    <Formik
      initialValues={{ username: "", password: "", email: "" }}
      onSubmit={handleSubmit}
    >
      {({}) => (
        <div className={cx("register")}>
          <Form className={cx("form")}>
            <h1>Register</h1>
            <InputLabel name="username" label="Username" type="text" />
            <InputLabel name="email" label="Email" type="text" />
            <InputLabel name="password" label="Password" isPassword />
            <Button type="submit" className={cx("submit")} outline>
              Register
            </Button>
            {error && <p className={cx("error")}>Fail</p>}
            {data && <p className={cx("error")}>Success</p>}
          </Form>
        </div>
      )}
    </Formik>
  );
};

export default Register;
