import { useRouter } from "next/router";
import { useEffect } from "react";
import { useMeQuery } from "../generated/graphql";

export const useCheckAuth = () => {
  const router = useRouter();

  const { data, loading } = useMeQuery();

  useEffect(() => {
    if (
      !loading &&
      data?.me &&
      (router.route === "/login" ||
        router.route === "/register" ||
        router.route === "/forgot-password" ||
        router.route === "/reset-password")
    ) {
      router.replace("/");
    }
  }, [loading, data, router]);

  return { data, loading };
};
