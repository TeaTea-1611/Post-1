import classNames from "classnames/bind";
import Link from "next/link";
import {
  MeDocument,
  MeQuery,
  useLogoutMutation,
  useMeQuery,
} from "../../generated/graphql";
import { Button } from "../Button";
import styles from "./layout.module.scss";

const cx = classNames.bind(styles);

function Header() {
  const { data, loading } = useMeQuery();
  const [logout, _] = useLogoutMutation();

  let body;

  if (loading) {
    body = (
      <li className={cx("link-item")}>
        {" "}
        <p>Loading...</p>
      </li>
    );
  } else if (!data?.me) {
    body = (
      <>
        <li className={cx("link-item")}>
          <Link href="/">About</Link>
        </li>
        <li className={cx("link-item")}>
          <Link href="/login">Login</Link>
        </li>
        <li className={cx("link-item")}>
          <Link href="/register">Register</Link>
        </li>
      </>
    );
  } else {
    body = (
      <>
        <li className={cx("link-item")}>
          <Link href="/">About</Link>
        </li>
        <li className={cx("link-item")}>
          <Link href="/">{data.me.username}</Link>
        </li>
        <li className={cx("link-item")}>
          <Button
            type="button"
            onClick={async () =>
              await logout({
                update(cache, { data }) {
                  if (data?.logout) {
                    cache.writeQuery<MeQuery>({
                      query: MeDocument,
                      data: {
                        me: null,
                      },
                    });
                  }
                },
              })
            }
          >
            Logout
          </Button>
        </li>
      </>
    );
  }

  return (
    <header className={cx("header")}>
      <div className={cx("inner")}>
        <div className={cx("logo")}>
          <Link href="/">TeaTea</Link>
        </div>
        <ul className={cx("header-link")}>{body}</ul>
      </div>
    </header>
  );
}

export default Header;
