import { Form, Formik, FormikHelpers } from "formik";
import { InputLabel } from "../components/Input";
import classNames from "classnames/bind";
import styles from "../styles/form.module.scss";
import { Button } from "../components/Button";
import {
  LoginInput,
  MeDocument,
  MeQuery,
  useLoginMutation,
} from "../generated/graphql";
import { mapFieldError } from "../helpers/mapFieldError";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import Link from "next/link";
import { useCheckAuth } from "../utils/useCheckAuth";
import Loading from "../components/Loading";

const cx = classNames.bind(styles);

const Login = () => {
  const router = useRouter();

  const { data: authData, loading: authLoading } = useCheckAuth();

  const [loginUser] = useLoginMutation();

  const handleSubmit = async (
    values: LoginInput,
    { setErrors }: FormikHelpers<LoginInput>
  ) => {
    const res = await loginUser({
      variables: {
        loginInput: values,
      },
      update: (cache, { data }) => {
        if (data?.login?.success) {
          cache.writeQuery<MeQuery>({
            query: MeDocument,
            data: {
              me: data.login.user,
            },
          });
        }
      },
    });
    if (res.data?.login?.errors) {
      setErrors(mapFieldError(res.data.login.errors));
    } else if (res.data?.login?.user) {
      toast(`Welcome ${res.data.login.user.username}!`);
      router.push("/");
    }
  };

  return (
    <Formik
      initialValues={{ usernameOrEmail: "", password: "" }}
      onSubmit={handleSubmit}
    >
      {() => (
        <div className={cx("reset-password")}>
          <Form
            className={cx("form", {
              loading: authLoading || (!authLoading && authData?.me),
            })}
          >
            {authLoading || (!authLoading && authData?.me) ? (
              <Loading large />
            ) : (
              <>
                <h1>Login</h1>
                <InputLabel
                  name="usernameOrEmail"
                  label="Username Or Email"
                  type="text"
                />
                <InputLabel name="password" label="Password" isPassword />
                <Button type="submit" className={cx("submit")}>
                  Login
                </Button>
                <div className={cx("change-form")}>
                  <p>
                    {`Don't have an account? `}
                    <Link href="/register">Register</Link>
                  </p>
                </div>
              </>
            )}
          </Form>
        </div>
      )}
    </Formik>
  );
};

export default Login;
