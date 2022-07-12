import "../styles/globals.scss";
import type { AppProps } from "next/app";
import { ApolloClient, ApolloProvider, InMemoryCache } from "@apollo/client";
import { ToastContainer } from "react-toastify";

const client = new ApolloClient({
  uri: "http://localhost:4000/graphql",
  cache: new InMemoryCache(),
  credentials: "include",
});

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <ApolloProvider client={client}>
        <Component {...pageProps} />
        <ToastContainer
          position="bottom-right"
          autoClose={3888}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="dark"
        />
      </ApolloProvider>
    </>
  );
}

export default MyApp;
