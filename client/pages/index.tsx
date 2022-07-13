import type { NextPage } from "next";
import classNames from "classnames/bind";
import styles from "../styles/Home.module.scss";
import Header from "../components/Layout/Header";
import { addApolloState, initializeApollo } from "../lib/apolloClient";
import { PostsDocument, usePostsQuery } from "../generated/graphql";
import Loading from "../components/Loading";

const cx = classNames.bind(styles);

const Home: NextPage = () => {
  const { data, loading } = usePostsQuery();
  return (
    <>
      <Header />
      <div className={cx("home")}>
        {loading ? (
          <Loading large />
        ) : (
          data?.posts?.map((post) => (
            <div key={post.id}>
              <h1>{post.title}</h1>
              <p>{post.text}</p>
            </div>
          ))
        )}
      </div>
    </>
  );
};

export const getStaticProps = async () => {
  const apolloClient = initializeApollo();

  await apolloClient.query({
    query: PostsDocument,
  });

  return addApolloState(apolloClient, {
    props: {},
  });
};

export default Home;
