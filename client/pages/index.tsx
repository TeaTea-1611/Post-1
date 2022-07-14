import type { NextPage } from "next";
import classNames from "classnames/bind";
import styles from "../styles/Home.module.scss";
import Header from "../components/Layout/Header";
import { addApolloState, initializeApollo } from "../lib/apolloClient";
import { PostsDocument, usePostsQuery } from "../generated/graphql";
import { Button } from "../components/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPencilSquare, faTrash } from "@fortawesome/free-solid-svg-icons";
import { NetworkStatus } from "@apollo/client";

const cx = classNames.bind(styles);

const Home: NextPage = () => {
  const { data, loading, fetchMore, networkStatus } = usePostsQuery({
    variables: { limit: 3 },
    notifyOnNetworkStatusChange: true,
  });

  const loadingMore = networkStatus === NetworkStatus.fetchMore;

  const loadMorePosts = () => {
    fetchMore({
      variables: { cursor: data?.posts?.cursor },
    });
  };

  return (
    <>
      <Header />
      <div className={cx("home")}>
        <div className={cx("inner")}>
          {loading && !loadingMore ? (
            <p>Loading...</p>
          ) : (
            data?.posts?.paginatedPosts?.map((post) => (
              <div key={post.id} className={cx("post")}>
                <div className={cx("header")}>
                  <h2>{post.title}</h2>
                  <span>{post.user.username}</span>
                </div>
                <div className={cx("body")}>
                  <div className={cx("text")}>
                    <p>{post.textSnippet}</p>
                  </div>
                  <div className={cx("btns")}>
                    <Button
                      type="button"
                      leftIcon={<FontAwesomeIcon icon={faPencilSquare} />}
                    >
                      Edit
                    </Button>
                    <Button
                      type="button"
                      leftIcon={<FontAwesomeIcon icon={faTrash} />}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
          {data?.posts?.hasMore && (
            <Button type="button" onClick={loadMorePosts}>
              {loadingMore ? "Loading..." : "Load More"}
            </Button>
          )}
        </div>
      </div>
    </>
  );
};

export const getStaticProps = async () => {
  const apolloClient = initializeApollo();

  await apolloClient.query({
    query: PostsDocument,
    variables: {
      limit: 3,
    },
  });

  return addApolloState(apolloClient, {
    props: {},
  });
};

export default Home;
