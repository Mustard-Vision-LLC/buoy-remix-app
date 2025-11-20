import { json, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import prisma from "~/db.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const sessions = await prisma.session.findMany();
  return json({ sessions });
}

export default function SessionsPage() {
  const { sessions } = useLoaderData<typeof loader>();

  return (
    <div style={{ padding: 20 }}>
      <h1>Sessions Data</h1>
      <pre>{JSON.stringify(sessions, null, 2)}</pre>
    </div>
  );
}