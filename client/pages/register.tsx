import { Form, Formik, FormikHelpers } from "formik";
import { InputLabel } from "../components/Input";
import classNames from "classnames/bind";
import styles from "../styles/form.module.scss";
import { Button } from "../components/Button";
import {
  MeDocument,
  MeQuery,
  RegisterInput,
  useRegisterMutation,
} from "../generated/graphql";
import { mapFieldError } from "../helpers/mapFieldError";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import Link from "next/link";

const cx = classNames.bind(styles);

const Register = () => {
  const router = useRouter();
  const [registerUser] = useRegisterMutation();

  const handleSubmit = async (
    values: RegisterInput,
    { setErrors }: FormikHelpers<RegisterInput>
  ) => {
    const res = await registerUser({
      variables: {
        registerInput: values,
      },
      update: (cache, { data }) => {
        if (data?.register?.success) {
          cache.writeQuery<MeQuery>({
            query: MeDocument,
            data: {
              me: data.register.user,
            },
          });
        }
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
      {() => (
        <div className={cx("register")}>
          <Form className={cx("form")}>
            <h1>Register</h1>
            <InputLabel name="username" label="Username" type="text" />
            <InputLabel name="email" label="Email" type="text" />
            <InputLabel name="password" label="Password" isPassword />
            <Button type="submit" className={cx("submit")}>
              Register
            </Button>
            <div className={cx("change-form")}>
              <p>
                {`Don't have an account? `}
                <Link href="/login">Login</Link>
              </p>
            </div>
          </Form>
        </div>
      )}
    </Formik>
  );
};

export default Register;
