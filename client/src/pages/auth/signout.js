import useRequest from "@/hooks/useRequest";
import { useRouter } from "next/router";
import { useEffect } from "react";

export default function Signout() {
  const router = useRouter();

  const { doRequest, errors } = useRequest({
    url: "/api/users/signout",
    method: "post",
    body: {},
    onSuccess: () => router.push("/"),
  });

  useEffect(() => {
    doRequest();
  }, []);

  return <div>Signing you out...</div>;
}
