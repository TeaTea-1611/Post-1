import { Form, Formik, FormikHelpers } from "formik";
import { Button } from "../components/Button";
import { InputLabel } from "../components/Input";
import classNames from "classnames/bind";
import styles from "../styles/form.module.scss";
import {
  MeDocument,
  MeQuery,
  ResetPasswordInput,
  useResetPasswordMutation,
} from "../generated/graphql";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import { mapFieldError } from "../helpers/mapFieldError";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faYinYang } from "@fortawesome/free-solid-svg-icons";
import { useCheckAuth } from "../utils/useCheckAuth";

const cx = classNames.bind(styles);

const ResetPassword = () => {
  const router = useRouter();
  const [resetPassword] = useResetPasswordMutation();
  const { data: authData, loading: authLoading } = useCheckAuth();

  const handleSubmit = async (
    values: ResetPasswordInput,
    { setErrors }: FormikHelpers<ResetPasswordInput>
  ) => {
    const res = await resetPassword({
      variables: {
        uid: router.query.uid as string,
        token: router.query.token as string,
        resetPasswordInput: values,
      },
      update: (cache, { data }) => {
        if (data?.resetPassword?.success) {
          cache.writeQuery<MeQuery>({
            query: MeDocument,
            data: {
              me: data.resetPassword.user,
            },
          });
        }
      },
    });
    if (res.data?.resetPassword?.errors) {
      const fieldErrors = mapFieldError(res.data.resetPassword.errors);
      if ("token" in fieldErrors) {
        toast.error(fieldErrors.token);
      }
      setErrors(fieldErrors);
    }
    if (res.data?.resetPassword?.user) {
      toast(res.data.resetPassword.message);
      router.push("/");
    }
  };
  return (
    <Formik initialValues={{ newPassword: "" }} onSubmit={handleSubmit}>
      {() => (
        <div className={cx("reset-password")}>
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
                <h1>Reset Password</h1>
                <InputLabel
                  name="newPassword"
                  label="New Password"
                  isPassword
                />
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

export default ResetPassword;
